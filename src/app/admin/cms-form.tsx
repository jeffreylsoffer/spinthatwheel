
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
import { Save, Trash2, PlusCircle, Wand2, Info, LoaderPinwheel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateCards, type GenerateCardsOutput } from '@/ai/flows/generate-cards-flow';
import { ruleGroups as defaultRuleGroups, prompts as defaultPrompts } from '@/lib/data';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from '@/components/ui/slider';


interface CmsFormProps {
  rules: RuleGroup[];
  prompts: Prompt[];
  modifiers: Modifier[];
  buzzerCountdown: number;
  isBuzzerRuleEnabled: boolean;
  onRulesChange: (rules: RuleGroup[]) => void;
  onPromptsChange: (prompts: Prompt[]) => void;
  onModifiersChange: (modifiers: Modifier[]) => void;
  onBuzzerCountdownChange: (value: number) => void;
  onIsBuzzerRuleEnabledChange: (enabled: boolean) => void;
  onSaveChanges: () => void;
}

export default function CmsForm({ 
  rules, 
  prompts, 
  modifiers, 
  buzzerCountdown,
  isBuzzerRuleEnabled,
  onRulesChange,
  onPromptsChange,
  onModifiersChange,
  onBuzzerCountdownChange,
  onIsBuzzerRuleEnabledChange,
  onSaveChanges,
}: CmsFormProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const buzzerRuleIndex = rules.findIndex(r => r.primary_rule.special === 'BUZZER');
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
      const defaultRegularRules = defaultRuleGroups.filter(r => r.primary_rule.special !== 'BUZZER');
      const sanitizedRules = defaultRegularRules.map(group => {
        if (group.primary_rule.name === 'Sexily') {
          return {
            ...group,
            primary_rule: { ...group.primary_rule, name: 'Excitedly', description: 'You must say everything with intense excitement.' },
            flipped_rule: { ...group.flipped_rule, name: 'Unexcitedly', description: 'You must say everything in a bored, unexcited tone.' }
          };
        }
        return group;
      });

      const result: GenerateCardsOutput = await generateCards({
        theme: aiPrompt,
        existingRules: sanitizedRules,
        existingPrompts: defaultPrompts,
      });
      
      const newRules = [...result.ruleGroups];
      const originalBuzzerRule = defaultRuleGroups.find(r => r.primary_rule.special === 'BUZZER');
      if (originalBuzzerRule) {
        newRules.splice(buzzerRuleIndex, 0, originalBuzzerRule);
      }
      
      onRulesChange(newRules);
      onPromptsChange(result.prompts);
      
      toast({
        title: 'AI Generation Complete!',
        description: `New cards with the theme "${aiPrompt}" have been generated.`,
      });

    } catch (error: any) {
      console.error('AI Generation failed', error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: "The AI was unable to generate new cards. Please try a different theme or check the console for more details."
      });
    } finally {
      setIsGenerating(false);
    }
  };


  // --- Change Handlers ---
  const handleRuleChange = (idx: number, ruleType: 'primary' | 'flipped', field: 'name' | 'description', value: string) => {
    const newRules = [...rules];
    const ruleToUpdate = newRules[idx];
    if (ruleType === 'primary') {
      ruleToUpdate.primary_rule[field] = value;
    } else {
      ruleToUpdate.flipped_rule[field] = value;
    }
    onRulesChange(newRules);
  };
  
  const handlePromptChange = (promptIdx: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[promptIdx].text = value;
    onPromptsChange(newPrompts);
  };

  const handleModifierChange = (modIdx: number, field: 'name' | 'description', value: string) => {
    const newModifiers = [...modifiers];
    newModifiers[modIdx][field] = value;
    onModifiersChange(newModifiers);
  };


  // --- Add/Delete Handlers ---
  const handleAddNewRule = () => {
    const newId = Date.now();
    const newRuleGroup: RuleGroup = {
      id: newId,
      name: `New Rule Group`,
      primary_rule: { id: newId + 1, name: '', description: '' },
      flipped_rule: { id: newId + 2, name: '', description: '' },
    };
    const regularRulesWithNew = [...regularRules, newRuleGroup];
    const newRules = buzzerRule ? [...regularRulesWithNew.slice(0, buzzerRuleIndex), buzzerRule, ...regularRulesWithNew.slice(buzzerRuleIndex)] : regularRulesWithNew;
    onRulesChange(newRules);
  };

  const handleDeleteRule = (groupId: number) => {
    onRulesChange(rules.filter((r) => r.id !== groupId));
  };

  const handleAddNewPrompt = () => {
    onPromptsChange([...prompts, { id: Date.now(), text: '' }]);
  };
  
  const handleDeletePrompt = (index: number) => {
    onPromptsChange(prompts.filter((_, i) => i !== index));
  };

  const handleAddNewModifier = () => {
    onModifiersChange([...modifiers, { id: Date.now(), type: 'FLIP', name: '', description: '' }]);
  };

  const handleDeleteModifier = (index: number) => {
    onModifiersChange(modifiers.filter((_, i) => i !== index));
  };

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
                  Enter a theme and let AI generate a new set of Rules and Prompts. This will replace any unsaved content in those sections. Modifiers and the special Buzzer rule will not be changed.
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
                    <LoaderPinwheel className="mr-2 h-5 w-5 animate-spin" />
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
      
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-headline">Rules ({regularRules.length})</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regularRules.map((group) => {
                  const originalIndex = rules.findIndex(r => r.id === group.id);
                  return (
                    <Card key={group.id} className="bg-card/50 relative group">
                       {group.primary_rule.special !== 'BUZZER' && (
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRule(group.id)}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                      <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4 p-4 border rounded-md">
                          <h4 className="font-bold text-lg">Rule</h4>
                          <div className="space-y-2">
                            <Label htmlFor={`rule-${group.id}-primary-name`}>Name</Label>
                            <Input
                              id={`rule-${group.id}-primary-name`}
                              value={group.primary_rule.name}
                              onChange={(e) => handleRuleChange(originalIndex, 'primary', 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`rule-${group.id}-primary-desc`}>Description</Label>
                            <Textarea
                              id={`rule-${group.id}-primary-desc`}
                              value={group.primary_rule.description}
                              onChange={(e) => handleRuleChange(originalIndex, 'primary', 'description', e.target.value)}
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
                              onChange={(e) => handleRuleChange(originalIndex, 'flipped', 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`rule-${group.id}-flipped-desc`}>Description</Label>
                            <Textarea
                              id={`rule-${group.id}-flipped-desc`}
                              value={group.flipped_rule.description}
                              onChange={(e) => handleRuleChange(originalIndex, 'flipped', 'description', e.target.value)}
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              )}
              <Button onClick={handleAddNewRule} variant="outline" className="min-h-[200px] flex flex-col items-center justify-center border-dashed h-full">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-muted-foreground">Add New Rule</span>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {buzzerRule && buzzerRuleIndex !== -1 && (
        <Accordion type="single" collapsible className="w-full" defaultValue="item-buzzer">
          <AccordionItem value="item-buzzer">
            <AccordionTrigger className="text-2xl font-headline text-accent">Special "Buzzer" Rule</AccordionTrigger>
            <AccordionContent className="pt-4">
               <Card className={cn("bg-card/50 border-2 border-accent shadow-accent/20 shadow-lg")}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Label htmlFor="buzzer-switch" className="text-lg font-medium">Enable Buzzer Rule</Label>
                        <Switch
                          id="buzzer-switch"
                          checked={isBuzzerRuleEnabled}
                          onCheckedChange={onIsBuzzerRuleEnabledChange}
                        />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-5 w-5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">When the buzzer sounds randomly in between rounds, whoever has this rule must do the action.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className={cn("space-y-6 pt-6 transition-opacity", !isBuzzerRuleEnabled && "opacity-50")}>
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                           <Label htmlFor="buzzer-countdown">Buzzer Countdown</Label>
                           <span className="font-medium text-accent">{buzzerCountdown} seconds</span>
                        </div>
                        <Slider
                            id="buzzer-countdown"
                            value={[buzzerCountdown]}
                            onValueChange={(value) => onBuzzerCountdownChange(value[0])}
                            min={1}
                            max={60}
                            step={1}
                            disabled={!isBuzzerRuleEnabled}
                        />
                    </div>
                    <div className="space-y-4 p-4 border rounded-md">
                      <h4 className="font-bold text-lg">Rule</h4>
                      <div className="space-y-2">
                        <Label htmlFor={`rule-${buzzerRule.id}-primary-name`}>Name</Label>
                        <Input
                          id={`rule-${buzzerRule.id}-primary-name`}
                          value={buzzerRule.primary_rule.name}
                          onChange={(e) => handleRuleChange(buzzerRuleIndex, 'primary', 'name', e.target.value)}
                          disabled={!isBuzzerRuleEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`rule-${buzzerRule.id}-primary-desc`}>Description</Label>
                        <Textarea
                          id={`rule-${buzzerRule.id}-primary-desc`}
                          value={buzzerRule.primary_rule.description}
                          onChange={(e) => handleRuleChange(buzzerRuleIndex, 'primary', 'description', e.target.value)}
                          rows={2}
                          disabled={!isBuzzerRuleEnabled}
                        />
                      </div>
                    </div>
                    <div className="space-y-4 p-4 border rounded-md bg-black/20">
                      <h4 className="font-bold text-lg">Flipped Rule</h4>
                      <div className="space-y-2">
                        <Label htmlFor={`rule-${buzzerRule.id}-flipped-name`}>Name</Label>
                        <Input
                          id={`rule-${buzzerRule.id}-flipped-name`}
                          value={buzzerRule.flipped_rule.name}
                          onChange={(e) => handleRuleChange(buzzerRuleIndex, 'flipped', 'name', e.target.value)}
                           disabled={!isBuzzerRuleEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`rule-${buzzerRule.id}-flipped-desc`}>Description</Label>
                        <Textarea
                          id={`rule-${buzzerRule.id}-flipped-desc`}
                          value={buzzerRule.flipped_rule.description}
                          onChange={(e) => handleRuleChange(buzzerRuleIndex, 'flipped', 'description', e.target.value)}
                          rows={2}
                           disabled={!isBuzzerRuleEnabled}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Accordion type="single" collapsible className="w-full" defaultValue="item-2">
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-2xl font-headline">Prompts ({prompts.length})</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt, promptIdx) => (
                <Card key={`${prompt.id}-${promptIdx}`} className="bg-card/50 relative group">
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
      </Accordion>

      <Accordion type="single" collapsible className="w-full" defaultValue="item-3">
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
        <Button size="lg" onClick={onSaveChanges}>
          <Save className="mr-2 h-5 w-5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
