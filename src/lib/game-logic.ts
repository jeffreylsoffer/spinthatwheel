
import type { SessionRule, WheelItem, Rule, Prompt, Modifier, WheelItemStyle, RuleGroup } from './types';

// Palette for the background segments of the wheel
export const SEGMENT_COLORS = [
  '#FFD262', // Yellow
  '#87EAF2', // Light Teal
  '#C8BFE7', // Lavender
  '#EE6352', // Red-Orange
];

// Palettes for the cards that sit inside the segments
export const RULE_CARD_COLORS = [
  { bg: '#F5A623', text: '#1F2937' }, // Orange with dark text
  { bg: '#6CD4FF', text: '#1F2937' }, // Light Blue with dark text
];

export const MODIFIER_CARD_COLORS = [
  { bg: '#B19CD9', text: '#FFFFFF' }, // Lavender with white text
  { bg: '#FF5349', text: '#FFFFFF' }, // Red-Orange with white text
  { bg: '#4DB6AC', text: '#FFFFFF' }, // Teal with white text
];

// Color palette for special cards
export const CARD_STYLES: Record<'PROMPT' | 'END', Omit<WheelItemStyle, 'segment'>> = {
  PROMPT:   { labelBg: '#FFFFFF', labelColor: '#1F2937' },   // White card
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

// Populates the wheel with an initial set of Rule items
export function populateWheel(
  sessionRules: SessionRule[]
): WheelItem[] {
  const rawWheel: Omit<WheelItem, 'color'>[] = [];

  // The wheel will contain one slot for each rule group
  const availableRules = sessionRules.map(r => r.primary);
  const shuffledRules = shuffle([...availableRules]);

  // Create cycling arrays of colors to ensure variety
  const shuffledSegmentColors = shuffle([...SEGMENT_COLORS]);
  const shuffledRuleCardColors = shuffle([...RULE_CARD_COLORS]);
  
  return shuffledRules.map((rule, index) => {
    // Cycle through the shuffled color palettes
    const segmentColor = shuffledSegmentColors[index % shuffledSegmentColors.length];
    const cardStyle = shuffledRuleCardColors[index % shuffledRuleCardColors.length];
    
    return {
      id: `rule-initial-${rule.id}`, // Unique ID for initial state
      type: 'RULE',
      label: 'Rule',
      data: rule,
      color: {
        segment: segmentColor,
        labelBg: cardStyle.bg,
        labelColor: cardStyle.text,
      },
    };
  });
}
