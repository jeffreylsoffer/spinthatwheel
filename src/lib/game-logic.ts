import { ruleGroups, prompts, modifiers } from './data';
import type { SessionRule, WheelItem, Rule, Prompt, Modifier, WheelItemStyle } from './types';

// Ratios for wheel population
export const RATIOS = {
  PROMPTS: 0.5,
  RULES: 0.3,
  MODIFIERS: 0.2,
};
export const TOTAL_SEGMENTS = 20;

// Color palette for wheel segments based on show photos
export const COLORS: Record<'PROMPT' | 'RULE' | 'MODIFIER' | 'END', WheelItemStyle> = {
  PROMPT:   { segment: '#FBBF24', labelBg: '#FFFFFF', labelColor: '#1F2937' },   // Yellow segment, white card
  MODIFIER: { segment: '#14B8A6', labelBg: '#0F766E', labelColor: '#FFFFFF' },   // Teal segment, dark teal card
  RULE:     { segment: '#D8B4FE', labelBg: '#FB923C', labelColor: '#1F2937' },   // Purple segment, orange card
  END:      { segment: '#374151', labelBg: '#111827', labelColor: '#F9FAFB' },   // Dark gray segment, black card
};


// Creates the initial set of rules for the game session
export function createSessionDeck(): SessionRule[] {
  return ruleGroups.map((group) => ({
    id: group.id,
    groupName: group.name,
    primary: group.primary_rule,
    flipped: group.flipped_rule,
    isFlipped: false,
  }));
}

// Shuffles an array using the Fisher-Yates algorithm
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Populates the wheel with a mix of items based on defined ratios
export function populateWheel(sessionRules: SessionRule[]): WheelItem[] {
  const wheel: WheelItem[] = [];

  const numPrompts = Math.floor(TOTAL_SEGMENTS * RATIOS.PROMPTS);
  const numRules = Math.floor(TOTAL_SEGMENTS * RATIOS.RULES);
  const numModifiers = TOTAL_SEGMENTS - numPrompts - numRules;

  // Add Prompts
  const shuffledPrompts = shuffle([...prompts]);
  for (let i = 0; i < numPrompts; i++) {
    const prompt = shuffledPrompts[i % shuffledPrompts.length];
    wheel.push({
      id: `prompt-${i}-${prompt.id}`,
      type: 'PROMPT',
      label: 'Prompt',
      data: prompt,
      color: COLORS.PROMPT,
    });
  }

  // Add Rules
  const availableRules = sessionRules.map(r => (r.isFlipped ? r.flipped : r.primary));
  if (availableRules.length > 0) {
    const shuffledRules = shuffle([...availableRules]);
    for (let i = 0; i < numRules; i++) {
      const rule = shuffledRules[i % shuffledRules.length];
      wheel.push({
        id: `rule-${i}-${rule.id}`,
        type: 'RULE',
        label: 'Rule',
        data: rule,
        color: COLORS.RULE,
      });
    }
  }

  // Add Modifiers
  const shuffledModifiers = shuffle([...modifiers]);
  for (let i = 0; i < numModifiers; i++) {
    const modifier = shuffledModifiers[i % shuffledModifiers.length];
    wheel.push({
      id: `modifier-${i}-${modifier.id}`,
      type: 'MODIFIER',
      label: 'Modifier',
      data: modifier,
      color: COLORS.MODIFIER,
    });
  }

  return shuffle(wheel);
}
