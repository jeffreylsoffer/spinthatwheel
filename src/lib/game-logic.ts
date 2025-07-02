
import type { SessionRule, WheelItem, Rule, Prompt, Modifier, WheelItemStyle, RuleGroup } from './types';

// New color scheme for segments
export const SEGMENT_COLORS = [
  '#C8BFE7', // Lavender
  '#45B0C9', // Teal
  '#FFD262', // Yellow
  '#EE6352', // Red-Orange
];

export const MODIFIER_COLORS = ['#45B0C9', '#EE6352']; // Teal or Red-Orange

// Color palette for cards based on their type
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

  for (const rule of shuffledRules) {
    rawWheel.push({
      id: `rule-initial-${rule.id}`, // Unique ID for initial state
      type: 'RULE',
      label: 'Rule',
      data: rule,
    });
  }
  
  return rawWheel.map((item, index) => {
    // Initial items are always rules, give them a random color
    const ruleColor = SEGMENT_COLORS[Math.floor(Math.random() * SEGMENT_COLORS.length)];
    return {
      ...item,
      color: {
        segment: ruleColor,
        labelBg: ruleColor,
        labelColor: '#1F2937',
      },
    };
  });
}
