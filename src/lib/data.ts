import type { RuleGroup, Prompt, Modifier } from './types';

export const ruleGroups: RuleGroup[] = [
  {
    id: 1,
    name: "Movement",
    primary_rule: { id: 101, name: "Walk", description: "You can only walk." },
    flipped_rule: { id: 102, name: "Run", description: "You can only run." },
  },
  {
    id: 2,
    name: "Communication",
    primary_rule: { id: 201, name: "Whisper", description: "You can only whisper." },
    flipped_rule: { id: 202, name: "Shout", description: "You must shout everything." },
  },
  {
    id: 3,
    name: "Action",
    primary_rule: { id: 301, name: "One Hand", description: "You can only use one hand." },
    flipped_rule: { id: 302, name: "No Hands", description: "You cannot use your hands." },
  },
];

export const prompts: Prompt[] = [
  { id: 401, text: "Tell a joke." },
  { id: 402, text: "Sing a song." },
  { id: 403, text: "Do an impression." },
  { id: 404, text: "Share a secret." },
  { id: 405, text: "Invent a new word." },
  { id: 406, text: "Compliment another player." },
  { id: 407, text: "Describe your perfect day." },
  { id: 408, text: "What's your favorite movie?" },
];

export const modifiers: Modifier[] = [
  { id: 501, type: 'SWAP', name: "Swap", description: "Swap one of your active rules with another player." },
  { id: 502, type: 'FLIP', name: "Flip", description: "Flip one of your active rules to its alternate version." },
  { id: 503, type: 'CLONE', name: "Clone", description: "Copy a rule from another player." },
  { id: 504, type: 'LEFT', name: "Left", description: "The player to your left gains this effect." },
];
