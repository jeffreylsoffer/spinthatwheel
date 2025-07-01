
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
import { Checkbox } from '@/components/ui/checkbox';

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
  initialShowRuleDescriptions: boolean;
}

export default function CmsForm({ initialData, initialRatios, initialShowRuleDescriptions }: CmsFormProps) {
  const [rules, setRules] = useState(initialData.ruleGroups);
  const [prompts, setPrompts] = useState(initialData.prompts);
  const [modifiers, setModifiers] = useState(initialData.modifiers);
  const [ratios, setRatios] = useState(initialRatios);
  const [showRuleDescriptions, setShowRuleDescriptions] = useState(initialShowRuleDescriptions);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
        existingRules: rules,
        existingPrompts: prompts,
      });
      
      setRules(result.ruleGroups);
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

  const handleSpecialChange = (groupIdx: number, ruleType: 'primary' | 'flipped', checked: boolean | 'indeterminate') => {
    const newRules = [...rules];
    const rule = ruleType === 'primary' ? newRules[groupIdx].primary_rule : newRules[groupIdx].flipped_rule;
    if (checked === true) {
        rule.special = 'BUZZER';
    } else {
        delete rule.special;
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

  const handleRatioChange = (type: 'prompts' | 'rules' | 'modifiers', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setRatios(prev => ({ ...prev, [type]: numValue }));
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
    setRules([...rules, newRuleGroup]);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddNewPrompt = () => {
    setPrompts([...prompts, { id: Date.now(), text: '' }]);
  };
  
  const handleDeletePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleAddNewModifier = () => {
    // Note: ModifierType in the component is hardcoded for simplicity.
    // A more robust solution would involve a dropdown to select the type.
    setModifiers([...modifiers, { id: Date.now(), type: 'FLIP', name: '', description: '' }]);
  };

  const handleDeleteModifier = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  // --- Save Handler ---
  const handleSaveChanges = () => {
    const totalRatio = ratios.prompts + ratios.rules + ratios.modifiers;
    if (totalRatio !== 100) {
      toast({
        variant: "destructive",
        title: "Invalid Ratios",
        description: "The total percentage for wheel configuration must be exactly 100%.",
      });
      return;
    }

    try {
      localStorage.setItem('cms_rules', JSON.stringify(rules));
      localStorage.setItem('cms_prompts', JSON.stringify(prompts));
      localStorage.setItem('cms_modifiers', JSON.stringify(modifiers));
      localStorage.setItem('cms_ratios', JSON.stringify(ratios));
      localStorage.setItem('cms_show_rule_descriptions', JSON.stringify(showRuleDescriptions));

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

  const totalRatio = ratios.prompts + ratios.rules + ratios.modifiers;

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
                  Enter a theme and let AI generate a new set of Rules and Prompts. This will replace any unsaved content in those sections. Modifiers will not be changed.
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
          <CardDescription>Adjust the percentage of each card type on the wheel. The total must be 100%.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ratio-rules">Rules %</Label>
            <Input id="ratio-rules" type="number" value={ratios.rules} onChange={(e) => handleRatioChange('rules', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratio-prompts">Prompts %</Label>
            <Input id="ratio-prompts" type="number" value={ratios.prompts} onChange={(e) => handleRatioChange('prompts', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratio-modifiers">Modifiers %</Label>
            <Input id="ratio-modifiers" type="number" value={ratios.modifiers} onChange={(e) => handleRatioChange('modifiers', e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className={cn("text-sm font-medium", totalRatio !== 100 && "text-destructive")}>
          Total: {totalRatio}% {totalRatio !== 100 && "(Must be 100%)"}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Game Display Settings</CardTitle>
          <CardDescription>Adjust how information is displayed during the game.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-descriptions"
              checked={showRuleDescriptions}
              onCheckedChange={(checked) => setShowRuleDescriptions(!!checked)}
            />
            <Label htmlFor="show-descriptions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Show rule descriptions on result cards.
            </Label>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-headline">Rules ({rules.length})</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((group, groupIdx) => (
                <Card key={group.id} className="bg-card/50 relative group">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRule(groupIdx)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4 p-4 border rounded-md">
                      <h4 className="font-bold text-lg">Primary Rule</h4>
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
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id={`rule-${group.id}-primary-special`}
                          checked={group.primary_rule.special === 'BUZZER'}
                          onCheckedChange={(checked) => handleSpecialChange(groupIdx, 'primary', checked)}
                        />
                        <Label htmlFor={`rule-${group.id}-primary-special`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          This is a special "Buzzer" rule.
                        </Label>
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
                       <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id={`rule-${group.id}-flipped-special`}
                          checked={group.flipped_rule.special === 'BUZZER'}
                          onCheckedChange={(checked) => handleSpecialChange(groupIdx, 'flipped', checked)}
                        />
                        <Label htmlFor={`rule-${group.id}-flipped-special`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          This is a special "Buzzer" rule.
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{mod.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
