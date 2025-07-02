
import type { SessionRule, WheelItem, Rule, Prompt, Modifier, WheelItemStyle, RuleGroup } from './types';

// Palette for the background segments of the wheel
export const SEGMENT_COLORS = [
  '#C8BFE7', // Lavender
  '#45B0C9', // Light Blue/Teal
  '#FFD262', // Yellow
  '#EE6352', // Red
  '#F4A36B', // Orange
];

// Palettes for the cards that sit inside the segments
export const RULE_CARD_COLORS = [
  { bg: '#C8BFE7', text: '#FFFFFF' }, // Lavender
  { bg: '#45B0C9', text: '#FFFFFF' }, // Light Blue/Teal
  { bg: '#FFD262', text: '#1F2937' }, // Yellow
  { bg: '#EE6352', text: '#FFFFFF' }, // Red
  { bg: '#F4A36B', text: '#1F2937' }, // Orange
];

// As requested: Lavender, Red, or Teal with white text
export const MODIFIER_CARD_COLORS = [
  { bg: '#C8BFE7', text: '#FFFFFF' }, // Lavender
  { bg: '#EE6352', text: '#FFFFFF' }, // Red
  { bg: '#45B0C9', text: '#FFFFFF' }, // Teal
];

// Color palette for special cards
export const CARD_STYLES: Record<'PROMPT' | 'END', Omit<WheelItemStyle, 'segment'>> = {
  PROMPT:   { labelBg: '#F8F8F8', labelColor: '#1F2937' },   // White card, black text
  END:      { labelBg: '#111827', labelColor: '#F9FAFB' },   // Black card, white text
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
  // The wheel will contain one slot for each rule group
  const availableRules = sessionRules.map(r => r.primary);
  const shuffledRules = shuffle([...availableRules]);

  // Create cycling arrays of colors to ensure variety
  const shuffledSegmentColors = shuffle([...SEGMENT_COLORS]);
  const shuffledRuleCardColors = shuffle([...RULE_CARD_COLORS]);
  
  return shuffledRules.map((rule, index) => {
    // Cycle through the shuffled color palettes
    const segmentColor = shuffledSegmentColors[index % shuffledSegmentColors.length];
    let cardStyle = shuffledRuleCardColors[index % shuffledRuleCardColors.length];

    // Ensure the card and segment have different colors
    // This loop ensures we find a card color that is different from the segment color
    let attempts = 0;
    while (cardStyle.bg === segmentColor && attempts < shuffledRuleCardColors.length) {
      cardStyle = shuffledRuleCardColors[(index + 1 + attempts) % shuffledRuleCardColors.length];
      attempts++;
    }
    
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
