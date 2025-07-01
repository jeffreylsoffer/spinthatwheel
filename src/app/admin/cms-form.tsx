"use client";

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';
import { Save } from 'lucide-react';

interface CmsFormProps {
  initialData: {
    ruleGroups: RuleGroup[];
    prompts: Prompt[];
    modifiers: Modifier[];
  };
}

export default function CmsForm({ initialData }: CmsFormProps) {
  const [rules, setRules] = useState(initialData.ruleGroups);
  const [prompts, setPrompts] = useState(initialData.prompts);
  const [modifiers, setModifiers] = useState(initialData.modifiers);

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

  const handleSaveChanges = () => {
    // In a real application, this would be a server action to write to a file or DB.
    console.log("Saving changes:", { rules, prompts, modifiers });
    alert("Saving changes... (This is a placeholder. Data is not actually saved.)");
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-headline">Rules ({rules.length})</AccordionTrigger>
          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {rules.map((group, groupIdx) => (
              <Card key={group.id} className="bg-card/50">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Primary Rule */}
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
                  {/* Flipped Rule */}
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-2xl font-headline">Prompts ({prompts.length})</AccordionTrigger>
          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {prompts.map((prompt, promptIdx) => (
              <Card key={prompt.id} className="bg-card/50">
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-2xl font-headline">Modifiers ({modifiers.length})</AccordionTrigger>
          <AccordionContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {modifiers.map((mod, modIdx) => (
              <Card key={mod.id} className="bg-card/50">
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
