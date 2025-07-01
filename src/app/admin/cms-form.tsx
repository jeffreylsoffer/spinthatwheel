
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
import type { RuleGroup, Prompt, Modifier, ModifierType } from '@/lib/types';
import { Save, Trash2, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
    setModifiers([...modifiers, { id: Date.now(), type: 'SWAP', name: '', description: '' }]);
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
