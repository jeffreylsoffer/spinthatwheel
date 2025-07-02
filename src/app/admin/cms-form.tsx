
"use client";

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';
import { Save, Trash2, PlusCircle, Wand2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateCards, type GenerateCardsOutput } from '@/ai/flows/generate-cards-flow';
import { Slider } from '@/components/ui/slider';

interface CmsFormProps {
  initialData: {
    ruleGroups: RuleGroup[];
    prompts: Prompt[];
    modifiers: Modifier[];
  };
  initialRatios: {
    prompts: number;
    rules: number;
    modifiers: number;
  };
}

export default function CmsForm({ initialData, initialRatios }: CmsFormProps) {
  const [rules, setRules] = useState(initialData.ruleGroups);
  const [prompts, setPrompts] = useState(initialData.prompts);
  const [modifiers, setModifiers] = useState(initialData.modifiers);
  const [ratios, setRatios] = useState(initialRatios);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const buzzerRuleIndex = rules.findIndex(r => r.primary_rule.special === 'BUZZER' || r.flipped_rule.special === 'BUZZER');
  const buzzerRule = buzzerRuleIndex !== -1 ? rules[buzzerRuleIndex] : null;
  const regularRules = rules.filter(r => r.primary_rule.special !== 'BUZZER');


  // --- AI Generation ---
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt is empty',
        description: 'Please enter a theme to generate cards.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result: GenerateCardsOutput = await generateCards({
        theme: aiPrompt,
        existingRules: regularRules,
        existingPrompts: prompts,
      });
      
      const newRules = [...result.ruleGroups];
      if (buzzerRule) {
        // Insert buzzer rule back at its original position relative to other special rules if any, or at the end.
        newRules.splice(buzzerRuleIndex, 0, buzzerRule);
      }
      setRules(newRules);
      setPrompts(result.prompts);
      
      toast({
        title: 'AI Generation Complete!',
        description: `New cards with the theme "${aiPrompt}" have been generated.`,
      });

    } catch (error) {
      console.error('AI Generation failed', error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: 'Could not generate new cards. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  // --- Change Handlers ---
  const handleRuleChange = (groupIdx: number, ruleType: 'primary' | 'flipped', field: 'name' | 'description', value: string) => {
    const newRules = [...rules];
    if (ruleType === 'primary') {
      newRules[groupIdx].primary_rule[field] = value;
    } else {
      newRules[groupIdx].flipped_rule[field] = value;
    }
    setRules(newRules);
  };
  
  const handlePromptChange = (promptIdx: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[promptIdx].text = value;
    setPrompts(newPrompts);
  };

  const handleModifierChange = (modIdx: number, field: 'name' | 'description', value: string) => {
    const newModifiers = [...modifiers];
    newModifiers[modIdx][field] = value;
    setModifiers(newModifiers);
  };

  const handleSliderChange = (value: number[]) => {
    const [rulesVal, promptsEndVal] = value;
    const promptsVal = promptsEndVal - rulesVal;
    const modifiersVal = 100 - promptsEndVal;

    setRatios({
      rules: rulesVal,
      prompts: promptsVal,
      modifiers: modifiersVal,
    });
  }


  // --- Add/Delete Handlers ---
  const handleAddNewRule = () => {
    const newId = Date.now();
    const newRuleGroup: RuleGroup = {
      id: newId,
      name: `New Rule Group`,
      primary_rule: { id: newId + 1, name: '', description: '' },
      flipped_rule: { id: newId + 2, name: '', description: '' },
    };
    // Add before the buzzer rule if it exists
    const insertIndex = buzzerRuleIndex !== -1 ? buzzerRuleIndex : rules.length;
    const newRules = [...rules];
    newRules.splice(insertIndex, 0, newRuleGroup);
    setRules(newRules);
  };

  const handleDeleteRule = (groupId: number) => {
    setRules(rules.filter((r) => r.id !== groupId));
  };

  const handleAddNewPrompt = () => {
    setPrompts([...prompts, { id: Date.now(), text: '' }]);
  };
  
  const handleDeletePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleAddNewModifier = () => {
    setModifiers([...modifiers, { id: Date.now(), type: 'FLIP', name: '', description: '' }]);
  };

  const handleDeleteModifier = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  // --- Save Handler ---
  const handleSaveChanges = () => {
    const totalRatio = ratios.rules + ratios.prompts + ratios.modifiers;
    if (totalRatio < 99 || totalRatio > 101) { // Allow for rounding errors
      toast({
        variant: "destructive",
        title: "Invalid Ratios",
        description: `The total percentage for wheel configuration must be exactly 100%. Current: ${totalRatio}%`,
      });
      return;
    }

    try {
      localStorage.setItem('cms_rules', JSON.stringify(rules));
      localStorage.setItem('cms_prompts', JSON.stringify(prompts));
      localStorage.setItem('cms_modifiers', JSON.stringify(modifiers));
      localStorage.setItem('cms_ratios', JSON.stringify(ratios));
      
      // Clean up old local storage items
      localStorage.removeItem('cms_show_rule_descriptions');
      localStorage.removeItem('cms_include_buzzer_rule');

      toast({
        title: "Changes Saved!",
        description: "Your new card and wheel configuration has been saved locally.",
      });
    } catch (error) {
      console.error("Failed to save to localStorage", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save changes to your browser's local storage.",
      });
    }
  };

  const totalRatio = ratios.rules + ratios.prompts + ratios.modifiers;

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="ai-generator">
          <AccordionTrigger className="text-2xl font-headline hover:no-underline">
            <div className="flex items-center gap-2">
              <Wand2 className="h-6 w-6" />
              <span>AI Card Generator</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border-0 shadow-none">
              <CardHeader className="pt-2">
                <CardDescription>
                  Enter a theme and let AI generate a new set of Rules and Prompts. This will replace any unsaved content in those sections. The special Buzzer rule and Modifiers will not be changed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Game Theme</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="e.g., Pirates, Space Opera, Film Noir, Cavemen..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-5 w-5" />
                  )}
                  Generate
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Card>
        <CardHeader>
          <CardTitle>Wheel Configuration</CardTitle>
          <CardDescription>Adjust the percentage of each card type on the wheel by dragging the sliders. The total must be 100%.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Slider
            value={[ratios.rules, ratios.rules + ratios.prompts]}
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-4 text-sm font-medium">
            <span style={{color: 'hsl(var(--chart-1))'}}>Rules: {ratios.rules}%</span>
            <span style={{color: 'hsl(var(--chart-2))'}}>Prompts: {ratios.prompts}%</span>
            <span style={{color: 'hsl(var(--chart-3))'}}>Modifiers: {ratios.modifiers}%</span>
          </div>
        </CardContent>
        <CardFooter className={cn("text-sm font-medium", totalRatio !== 100 && "text-destructive")}>
          Total: {totalRatio}% {totalRatio !== 100 && "(Must be 100%)"}
        </CardFooter>
      </Card>
      
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-headline">Rules ({rules.length})</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((group, groupIdx) => {
                const isBuzzer = group.primary_rule.special === 'BUZZER' || group.flipped_rule.special === 'BUZZER';
                return (
                  <Card key={group.id} className={cn("bg-card/50 relative group", isBuzzer && "border-2 border-accent shadow-accent/20 shadow-lg")}>
                    {!isBuzzer && (
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRule(group.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                     {isBuzzer && (
                      <CardHeader className='pb-0'>
                        <CardTitle className='font-headline text-xl text-accent'>Special "Buzzer" Rule</CardTitle>
                      </CardHeader>
                    )}
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-4 p-4 border rounded-md">
                        <h4 className="font-bold text-lg">Rule</h4>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-${group.id}-primary-name`}>Name</Label>
                          <Input
                            id={`rule-${group.id}-primary-name`}
                            value={group.primary_rule.name}
                            onChange={(e) => handleRuleChange(groupIdx, 'primary', 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-${group.id}-primary-desc`}>Description</Label>
                          <Textarea
                            id={`rule-${group.id}-primary-desc`}
                            value={group.primary_rule.description}
                            onChange={(e) => handleRuleChange(groupIdx, 'primary', 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="space-y-4 p-4 border rounded-md bg-black/20">
                        <h4 className="font-bold text-lg">Flipped Rule</h4>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-${group.id}-flipped-name`}>Name</Label>
                          <Input
                            id={`rule-${group.id}-flipped-name`}
                            value={group.flipped_rule.name}
                            onChange={(e) => handleRuleChange(groupIdx, 'flipped', 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`rule-${group.id}-flipped-desc`}>Description</Label>
                          <Textarea
                            id={`rule-${group.id}-flipped-desc`}
                            value={group.flipped_rule.description}
                            onChange={(e) => handleRuleChange(groupIdx, 'flipped', 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              <Button onClick={handleAddNewRule} variant="outline" className="min-h-[200px] flex flex-col items-center justify-center border-dashed h-full">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-muted-foreground">Add New Rule</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-2xl font-headline">Prompts ({prompts.length})</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt, promptIdx) => (
                <Card key={prompt.id} className="bg-card/50 relative group">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePrompt(promptIdx)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                   <CardContent className="pt-6">
                      <Label htmlFor={`prompt-${prompt.id}`}>Prompt Text</Label>
                      <Textarea
                        id={`prompt-${prompt.id}`}
                        value={prompt.text}
                        onChange={(e) => handlePromptChange(promptIdx, e.target.value)}
                        rows={4}
                      />
                   </CardContent>
                </Card>
              ))}
              <Button onClick={handleAddNewPrompt} variant="outline" className="min-h-[148px] flex flex-col items-center justify-center border-dashed h-full">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-muted-foreground">Add New Prompt</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-2xl font-headline">Modifiers ({modifiers.length})</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modifiers.map((mod, modIdx) => (
                <Card key={mod.id} className="bg-card/50 relative group">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteModifier(modIdx)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor={`mod-${mod.id}-name`}>Name</Label>
                      <Input
                        id={`mod-${mod.id}-name`}
                        value={mod.name}
                        onChange={(e) => handleModifierChange(modIdx, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`mod-${mod.id}-desc`}>Description</Label>
                      <Textarea
                        id={`mod-${mod.id}-desc`}
                        value={mod.description}
                        onChange={(e) => handleModifierChange(modIdx, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
               <Button onClick={handleAddNewModifier} variant="outline" className="min-h-[200px] flex flex-col items-center justify-center border-dashed h-full">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-muted-foreground">Add New Modifier</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-8">
        <Button size="lg" onClick={handleSaveChanges}>
          <Save className="mr-2 h-5 w-5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
