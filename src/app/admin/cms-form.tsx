"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';
import { Trash2, PlusCircle, Info, LoaderPinwheel, Settings2, ScrollText, MessageSquareText, Shuffle, Bell, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateCards, type GenerateCardsOutput } from '@/ai/flows/generate-cards-flow';
import { ruleGroups as defaultRuleGroups, prompts as defaultPrompts } from '@/lib/data';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from '@/components/ui/slider';

// Consistent, always-visible section wrapper
function Section({ title, icon: Icon, color, right, children }: {
  title: string;
  icon?: React.ElementType;
  color?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
        <h2 className={cn("flex items-center gap-2 text-2xl font-headline", color)}>
          {Icon && <Icon className="h-6 w-6" />}
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

// Small info tooltip used in section headers
function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-5 w-5 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact two-sided rule editor (Rule / Flipped) — defined at module level to avoid remount on parent re-render
function RuleEditor({ group, idx, disabled, onRuleChange }: {
  group: RuleGroup;
  idx: number;
  disabled?: boolean;
  onRuleChange: (idx: number, ruleType: 'primary' | 'flipped', field: 'name' | 'description', value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['primary', 'flipped'] as const).map((side) => {
        const r = side === 'primary' ? group.primary_rule : group.flipped_rule;
        return (
          <div key={side} className={cn("space-y-2", side === 'flipped' && "sm:border-l sm:border-border/60 sm:pl-4")}>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{side === 'primary' ? 'Rule' : 'Flipped'}</span>
            <Input aria-label={`${side} name`} placeholder="Name" value={r.name} disabled={disabled} onChange={(e) => onRuleChange(idx, side, 'name', e.target.value)} />
            <Textarea aria-label={`${side} description`} placeholder="Description" rows={2} value={r.description} disabled={disabled} onChange={(e) => onRuleChange(idx, side, 'description', e.target.value)} />
          </div>
        );
      })}
    </div>
  );
}

interface CmsFormProps {
  rules: RuleGroup[];
  prompts: Prompt[];
  modifiers: Modifier[];
  buzzerCountdown: number;
  isBuzzerRuleEnabled: boolean;
  isGoldenRuleEnabled: boolean;
  goldenRule: RuleGroup;
  onRulesChange: (rules: RuleGroup[]) => void;
  onPromptsChange: (prompts: Prompt[]) => void;
  onModifiersChange: (modifiers: Modifier[]) => void;
  onBuzzerCountdownChange: (value: number) => void;
  onIsBuzzerRuleEnabledChange: (enabled: boolean) => void;
  onIsGoldenRuleEnabledChange: (enabled: boolean) => void;
  onGoldenRuleChange: (rule: RuleGroup) => void;
  promptScoring: 'flat' | 'perRule';
  onPromptScoringChange: (v: 'flat' | 'perRule') => void;
  wheelRuleCount: number;
  onWheelRuleCountChange: (n: number) => void;
  onSaveChanges: () => void;
}

export default function CmsForm({
  rules,
  prompts,
  modifiers,
  buzzerCountdown,
  isBuzzerRuleEnabled,
  isGoldenRuleEnabled,
  goldenRule,
  onRulesChange,
  onPromptsChange,
  onModifiersChange,
  onBuzzerCountdownChange,
  onIsBuzzerRuleEnabledChange,
  onIsGoldenRuleEnabledChange,
  onGoldenRuleChange,
  promptScoring,
  onPromptScoringChange,
  wheelRuleCount,
  onWheelRuleCountChange,
}: CmsFormProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const { toast } = useToast();

  const buzzerRuleIndex = rules.findIndex(r => r.primary_rule.special === 'BUZZER');
  const buzzerRule = buzzerRuleIndex !== -1 ? rules[buzzerRuleIndex] : null;
  const regularRules = rules.filter(r => r.primary_rule.special !== 'BUZZER');
  const ruleCountValue = wheelRuleCount === 0 ? rules.length : Math.min(wheelRuleCount, rules.length);
  const usingAllRules = wheelRuleCount === 0 || wheelRuleCount >= rules.length;

  // --- AI Generation ---
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please enter a theme to generate cards.' });
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
      if (originalBuzzerRule && buzzerRuleIndex !== -1) {
        newRules.splice(buzzerRuleIndex, 0, originalBuzzerRule);
      }

      onRulesChange(newRules);
      onPromptsChange(result.prompts);

      setAiPrompt('');
      setAiOpen(false);
      toast({ title: 'AI Generation Complete!', description: `New cards with the theme "${aiPrompt}" have been generated.` });
    } catch (error: any) {
      console.error('AI Generation failed', error);
      toast({ variant: 'destructive', title: 'AI Generation Failed', description: "The AI was unable to generate new cards. Please try a different theme or check the console for more details." });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Change Handlers ---
  const handleRuleChange = (idx: number, ruleType: 'primary' | 'flipped', field: 'name' | 'description', value: string) => {
    const newRules = [...rules];
    const group = newRules[idx];
    if (ruleType === 'primary') {
      newRules[idx] = { ...group, primary_rule: { ...group.primary_rule, [field]: value } };
    } else {
      newRules[idx] = { ...group, flipped_rule: { ...group.flipped_rule, [field]: value } };
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
    let finalRules;
    if (buzzerRule && buzzerRuleIndex !== -1) {
      const rulesCopy = [...regularRulesWithNew];
      rulesCopy.splice(buzzerRuleIndex, 0, buzzerRule);
      finalRules = rulesCopy;
    } else {
      finalRules = regularRulesWithNew;
    }
    onRulesChange(finalRules);
  };

  const handleDeleteRule = (groupId: number) => onRulesChange(rules.filter((r) => r.id !== groupId));
  const handleAddNewPrompt = () => onPromptsChange([...prompts, { id: Date.now(), text: '' }]);
  const handleDeletePrompt = (index: number) => onPromptsChange(prompts.filter((_, i) => i !== index));
  const handleAddNewModifier = () => onModifiersChange([...modifiers, { id: Date.now(), type: 'FLIP', name: '', description: '' }]);
  const handleDeleteModifier = (index: number) => onModifiersChange(modifiers.filter((_, i) => i !== index));

  return (
    <div className="space-y-10">
      {/* Game Settings */}
      <Section title="Game Settings" icon={Settings2}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rules Per Game</CardTitle>
              <CardDescription>Random rules placed on the wheel each game. Max ({rules.length}) uses all.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4">
                <Slider min={1} max={rules.length} step={1} value={[ruleCountValue]} onValueChange={([v]) => onWheelRuleCountChange(v >= rules.length ? 0 : v)} className="flex-1" />
                <span className="w-10 text-right font-bold tabular-nums">{ruleCountValue}</span>
              </div>
              <p className="text-xs text-muted-foreground">{usingAllRules ? `Using all ${rules.length} rules.` : `${ruleCountValue} of ${rules.length} rules per game.`}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Prompt Scoring</CardTitle>
              <CardDescription>Points awarded when a player completes a prompt.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button type="button" variant={promptScoring === 'flat' ? 'default' : 'outline'} onClick={() => onPromptScoringChange('flat')} className="flex-1">+2 (flat)</Button>
                <Button type="button" variant={promptScoring === 'perRule' ? 'default' : 'outline'} onClick={() => onPromptScoringChange('perRule')} className="flex-1">+1 / rule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Rules */}
      <Section title={`Rules (${regularRules.length})`} icon={ScrollText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regularRules.map((group) => {
            const originalIndex = rules.findIndex(r => r.id === group.id);
            return (
              <Card key={group.id} className="bg-card/50 relative group">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRule(group.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
                <CardContent className="pt-6">
                  <RuleEditor group={group} idx={originalIndex} onRuleChange={handleRuleChange} />
                </CardContent>
              </Card>
            );
          })}
          <Button onClick={handleAddNewRule} variant="outline" className="min-h-[160px] flex flex-col items-center justify-center border-dashed h-full">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-muted-foreground">Add New Rule</span>
          </Button>
        </div>
      </Section>

      {/* Special Buzzer Rule */}
      {buzzerRule && buzzerRuleIndex !== -1 && (
        <Section
          title={'Special "Buzzer" Rule'}
          icon={Bell}
          color="text-accent"
          right={
            <div className="flex items-center gap-3">
              <Label htmlFor="buzzer-switch" className="text-sm">Enabled</Label>
              <Switch id="buzzer-switch" checked={isBuzzerRuleEnabled} onCheckedChange={onIsBuzzerRuleEnabledChange} />
              <InfoTip text="When the buzzer sounds randomly between rounds, whoever has this rule must do the action." />
            </div>
          }
        >
          <Card className={cn("bg-card/50 border-2 border-accent shadow-accent/20 shadow-lg transition-opacity", !isBuzzerRuleEnabled && "opacity-50")}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="buzzer-countdown">Buzzer Countdown</Label>
                  <span className="font-medium text-accent">{buzzerCountdown} seconds</span>
                </div>
                <Slider id="buzzer-countdown" value={[buzzerCountdown]} onValueChange={(value) => onBuzzerCountdownChange(value[0])} min={1} max={60} step={1} disabled={!isBuzzerRuleEnabled} />
              </div>
              <RuleEditor group={buzzerRule} idx={buzzerRuleIndex} disabled={!isBuzzerRuleEnabled} onRuleChange={handleRuleChange} />
            </CardContent>
          </Card>
        </Section>
      )}

      {/* Golden Rule */}
      <Section
        title="Golden Rule"
        icon={Crown}
        color="text-yellow-500"
        right={
          <div className="flex items-center gap-3">
            <Label htmlFor="golden-rule-switch" className="text-sm">Enabled</Label>
            <Switch id="golden-rule-switch" checked={isGoldenRuleEnabled} onCheckedChange={onIsGoldenRuleEnabledChange} />
            <InfoTip text="The Golden Rule applies to ALL players for the entire game. It can be swapped or flipped via modifiers." />
          </div>
        }
      >
        <Card className={cn("bg-card/50 border-2 border-yellow-500/50 shadow-yellow-500/10 shadow-lg transition-opacity", !isGoldenRuleEnabled && "opacity-50")}>
          <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rule</span>
              <Input aria-label="Golden rule name" placeholder="Name" value={goldenRule.primary_rule.name} disabled={!isGoldenRuleEnabled} onChange={(e) => onGoldenRuleChange({ ...goldenRule, primary_rule: { ...goldenRule.primary_rule, name: e.target.value } })} />
              <Textarea aria-label="Golden rule description" placeholder="Description" rows={2} value={goldenRule.primary_rule.description} disabled={!isGoldenRuleEnabled} onChange={(e) => onGoldenRuleChange({ ...goldenRule, primary_rule: { ...goldenRule.primary_rule, description: e.target.value } })} />
            </div>
            <div className="space-y-2 sm:border-l sm:border-border/60 sm:pl-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flipped</span>
              <Input aria-label="Golden flipped name" placeholder="Name" value={goldenRule.flipped_rule.name} disabled={!isGoldenRuleEnabled} onChange={(e) => onGoldenRuleChange({ ...goldenRule, flipped_rule: { ...goldenRule.flipped_rule, name: e.target.value } })} />
              <Textarea aria-label="Golden flipped description" placeholder="Description" rows={2} value={goldenRule.flipped_rule.description} disabled={!isGoldenRuleEnabled} onChange={(e) => onGoldenRuleChange({ ...goldenRule, flipped_rule: { ...goldenRule.flipped_rule, description: e.target.value } })} />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Prompts */}
      <Section title={`Prompts (${prompts.length})`} icon={MessageSquareText}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt, promptIdx) => (
            <Card key={`${prompt.id}-${promptIdx}`} className="bg-card/50 relative group">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePrompt(promptIdx)}>
                <Trash2 className="h-5 w-5" />
              </Button>
              <CardContent className="pt-6 space-y-2">
                <Label htmlFor={`prompt-${prompt.id}-${promptIdx}`}>Prompt Text</Label>
                <Textarea id={`prompt-${prompt.id}-${promptIdx}`} value={prompt.text} onChange={(e) => handlePromptChange(promptIdx, e.target.value)} rows={3} />
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleAddNewPrompt} variant="outline" className="min-h-[120px] flex flex-col items-center justify-center border-dashed h-full">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-muted-foreground">Add New Prompt</span>
          </Button>
        </div>
      </Section>

      {/* Modifiers */}
      <Section title={`Modifiers (${modifiers.length})`} icon={Shuffle}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modifiers.map((mod, modIdx) => (
            <Card key={`${mod.id}-${modIdx}`} className="bg-card/50 relative group">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteModifier(modIdx)}>
                <Trash2 className="h-5 w-5" />
              </Button>
              <CardContent className="space-y-3 pt-6">
                <div className="space-y-2">
                  <Label htmlFor={`mod-${mod.id}-name`}>Name</Label>
                  <Input id={`mod-${mod.id}-name`} value={mod.name} onChange={(e) => handleModifierChange(modIdx, 'name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`mod-${mod.id}-desc`}>Description</Label>
                  <Textarea id={`mod-${mod.id}-desc`} value={mod.description} onChange={(e) => handleModifierChange(modIdx, 'description', e.target.value)} rows={2} />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleAddNewModifier} variant="outline" className="min-h-[160px] flex flex-col items-center justify-center border-dashed h-full">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-muted-foreground">Add New Modifier</span>
          </Button>
        </div>
      </Section>

      {/* Floating one-shot AI generator */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogTrigger asChild>
          <Button size="icon" aria-label="Generate cards with AI" className="fixed bottom-28 right-6 sm:bottom-6 z-30 h-14 w-14 rounded-full shadow-lg shadow-accent/30">
            <Sparkles className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2"><Sparkles className="h-5 w-5" /> Generate Cards</DialogTitle>
            <DialogDescription>Enter a theme — AI rewrites all Rules &amp; Prompts. Modifiers and the Buzzer rule are left untouched.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Pirates, Space Opera, Film Noir, Cavemen..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
            autoFocus
          />
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? <LoaderPinwheel className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Generate
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
