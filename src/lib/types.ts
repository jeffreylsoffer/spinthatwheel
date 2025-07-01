export interface Rule {
  id: number;
  name: string;
  description: string;
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

export type ModifierType = 'SWAP' | 'FLIP' | 'CLONE' | 'LEFT';

export interface Modifier {
  id: number;
  type: ModifierType;
  name: string;
  description: string;
}

export type WheelItemType = 'RULE' | 'PROMPT' | 'MODIFIER';

export interface WheelItem {
  id: string; 
  type: WheelItemType;
  label: string;
  data: Rule | Prompt | Modifier;
  color: string;
}

export interface SessionRule {
  id: number;
  groupName: string;
  primary: Rule;
  flipped: Rule;
  isFlipped: boolean;
}
