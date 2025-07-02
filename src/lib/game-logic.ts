
import type { SessionRule, WheelItem, Rule, Prompt, Modifier, WheelItemStyle, RuleGroup } from './types';

// Palette for the background segments of the wheel
export const SEGMENT_COLORS = [
  '#9A91B4', // Darker Lavender
  '#378C9E', // Darker Teal
  '#CCAA4F', // Darker Yellow
  '#BE4F41', // Darker Red-Orange
  '#C38256', // Darker Orange
];

// Palettes for the cards that sit inside the segments
export const RULE_CARD_COLORS = [
  { bg: '#9A91B4', text: '#1F2937' }, 
  { bg: '#378C9E', text: '#1F2937' }, 
  { bg: '#CCAA4F', text: '#1F2937' }, 
  { bg: '#BE4F41', text: '#1F2937' }, 
  { bg: '#C38256', text: '#1F2937' }, 
  { bg: '#D4D4D4', text: '#1F2937' },
];

// As requested: Lavender, Red, or Teal with white text
export const MODIFIER_CARD_COLORS = [
  { bg: '#9A91B4', text: '#FFFFFF' }, // Darker Lavender
  { bg: '#BE4F41', text: '#FFFFFF' }, // Darker Red-Orange
  { bg: '#378C9E', text: '#FFFFFF' }, // Darker Teal
];

// Color palette for special cards
export const CARD_STYLES: Record<'PROMPT' | 'END', Omit<WheelItemStyle, 'segment'>> = {
  PROMPT:   { labelBg: '#D4D4D4', labelColor: '#1F2937' },   // Darker White/Light Grey card
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
    if (cardStyle.bg === segmentColor) {
      cardStyle = shuffledRuleCardColors[(index + 1) % shuffledRuleCardColors.length];
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
