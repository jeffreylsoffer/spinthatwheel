
import type { SessionRule, WheelItem, Rule, Prompt, Modifier, WheelItemStyle, RuleGroup } from './types';

// Ratios for wheel population
export const RATIOS = {
  RULES: 0.5,
  PROMPTS: 0.25,
  MODIFIERS: 0.25,
};
export const TOTAL_SEGMENTS = 20;

// New color scheme for segments
export const SEGMENT_COLORS = [
  '#C8BFE7', // Lavender
  '#45B0C9', // Teal
  '#FFD262', // Yellow
  '#EE6352', // Red-Orange
];

// Color palette for cards based on their type
export const CARD_STYLES: Record<'PROMPT' | 'RULE' | 'MODIFIER' | 'END', Omit<WheelItemStyle, 'segment'>> = {
  PROMPT:   { labelBg: '#FFFFFF', labelColor: '#1F2937' },   // White card
  RULE:     { labelBg: '#FFD262', labelColor: '#1F2937' },   // Yellow card
  MODIFIER: { labelBg: '#45B0C9', labelColor: '#1F2937' },   // Teal card
  END:      { labelBg: '#111827', labelColor: '#F9FAFB' },   // Black card
};


// Creates the initial set of rules for the game session
export function createSessionDeck(ruleGroups: RuleGroup[]): SessionRule[] {
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
export function populateWheel(
  sessionRules: SessionRule[], 
  prompts: Prompt[], 
  modifiers: Modifier[],
  ratios: { PROMPTS: number, RULES: number, MODIFIERS: number }
): WheelItem[] {
  const rawWheel: Omit<WheelItem, 'color'>[] = [];

  const numPrompts = Math.round(TOTAL_SEGMENTS * ratios.PROMPTS);
  const numRules = Math.round(TOTAL_SEGMENTS * ratios.RULES);
  const numModifiers = TOTAL_SEGMENTS - numPrompts - numRules;

  // Add Prompts
  if (prompts.length > 0) {
    const shuffledPrompts = shuffle([...prompts]);
    for (let i = 0; i < numPrompts; i++) {
      const prompt = shuffledPrompts[i % shuffledPrompts.length];
      rawWheel.push({
        id: `prompt-${i}-${prompt.id}`,
        type: 'PROMPT',
        label: 'Prompt',
        data: prompt,
      });
    }
  }

  // Add Rules
  const availableRules = sessionRules.map(r => (r.isFlipped ? r.flipped : r.primary));
  if (availableRules.length > 0) {
    const shuffledRules = shuffle([...availableRules]);
    for (let i = 0; i < numRules; i++) {
      const rule = shuffledRules[i % shuffledRules.length];
      rawWheel.push({
        id: `rule-${i}-${rule.id}`,
        type: 'RULE',
        label: 'Rule',
        data: rule,
      });
    }
  }

  // Add Modifiers
  if (modifiers.length > 0) {
    const shuffledModifiers = shuffle([...modifiers]);
    for (let i = 0; i < numModifiers; i++) {
      const modifier = shuffledModifiers[i % shuffledModifiers.length];
      rawWheel.push({
        id: `modifier-${i}-${modifier.id}`,
        type: 'MODIFIER',
        label: 'Modifier',
        data: modifier,
      });
    }
  }

  const shuffledWheel = shuffle(rawWheel);

  return shuffledWheel.map((item, index) => {
    const cardStyle = CARD_STYLES[item.type];
    const segmentColor = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
    return {
      ...item,
      color: {
        segment: segmentColor,
        ...cardStyle,
      },
    };
  });
}
