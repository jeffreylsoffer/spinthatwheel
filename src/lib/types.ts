export interface Rule {
  id: number;
  name: string;
  description: string;
  special?: 'BUZZER';
}

export interface RuleGroup {
  id: number;
  name: string;
  primary_rule: Rule;
  flipped_rule: Rule;
}

export interface Prompt {
  id: number;
  text: string;
}

export type ModifierType = 'LEFT' | 'RIGHT' | 'FLIP' | 'CLONE';

export interface Modifier {
  id: number;
  type: ModifierType;
  name: string;
  description: string;
}

export type WheelItemType = 'RULE' | 'PROMPT' | 'MODIFIER' | 'END';

export interface WheelItemStyle {
  segment: string;
  labelBg: string;
  labelColor: string;
}

export interface WheelItem {
  id: string; 
  type: WheelItemType;
  label: string;
  data: Rule | Prompt | Modifier | { name: string, description: string };
  color: WheelItemStyle;
}

export interface SessionRule {
  id: number;
  groupName: string;
  primary: Rule;
  flipped: Rule;
  isFlipped: boolean;
}
