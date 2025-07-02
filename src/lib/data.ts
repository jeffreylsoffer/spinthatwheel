
import type { RuleGroup, Prompt, Modifier } from './types';

export const ruleGroups: RuleGroup[] = [
  {
    id: 1,
    name: "Voice",
    primary_rule: { id: 101, name: "Sing-Song", description: "You must speak in a sing-song voice." },
    flipped_rule: { id: 102, name: "Monotone", description: "You must speak in a monotone voice." },
  },
  {
    id: 2,
    name: "Speech",
    primary_rule: { id: 201, name: "No Filler Words", description: "You cannot use filler words (um, uh, like)." },
    flipped_rule: { id: 202, name: "All Filler Words", description: "You must use filler words in every sentence." },
  },
  {
    id: 3,
    name: "Language",
    primary_rule: { id: 301, name: "No Cursing", description: "You are not allowed to curse." },
    flipped_rule: { id: 302, name: "Must Curse", description: "You must include a curse word in every sentence." },
  },
  {
    id: 4,
    name: "Impression",
    primary_rule: { id: 401, name: "Christopher Walken", description: "You must do your best Christopher Walken impression." },
    flipped_rule: { id: 402, name: "Robert DeNiro", description: "You must do your worst Robert DeNiro impression." },
  },
  {
    id: 5,
    name: "Manner",
    primary_rule: { id: 501, name: "Politely", description: "You must say everything very politely." },
    flipped_rule: { id: 502, name: "Rudely", description: "You must say everything very rudely." },
  },
  {
    id: 6,
    name: "Sentence Structure",
    primary_rule: { id: 601, name: "Questions Only", description: "You can only speak in questions." },
    flipped_rule: { id: 602, name: "Statements Only", description: "You can only speak in statements." },
  },
  {
    id: 7,
    name: "Humor",
    primary_rule: { id: 701, name: "Allergic to Jokes", description: "You are deathly allergic to jokes." },
    flipped_rule: { id: 702, name: "Must Laugh", description: "You must laugh hysterically at everything." },
  },
  {
    id: 8,
    name: "Tone",
    primary_rule: { id: 801, name: "Sexily", description: "You must say everything sexily." },
    flipped_rule: { id: 802, name: "Unsexily", description: "You must say everything unsexily." },
  },
  {
    id: 9,
    name: "Facial Expression",
    primary_rule: { id: 901, name: "No Teeth", description: "You cannot show your teeth while talking." },
    flipped_rule: { id: 902, name: "All Teeth", description: "You must always be showing your teeth." },
  },
  {
    id: 10,
    name: "Energy",
    primary_rule: { id: 1001, name: "Big Finish", description: "You must end every sentence with big energy." },
    flipped_rule: { id: 1002, name: "Low Finish", description: "You must end every sentence with low energy." },
  },
  {
    id: 11,
    name: "Nickname",
    primary_rule: { id: 1101, name: "Big Dog", description: "You must call everyone 'Big Dog'." },
    flipped_rule: { id: 1102, name: "Formal Name", description: "You must refer to everyone by their formal name." },
  },
  {
    id: 12,
    name: "Repetition",
    primary_rule: { id: 1201, name: "Repeat Last Word", description: "You must repeat the last word of every sentence... sentence." },
    flipped_rule: { id: 1202, name: "Repeat First Word", description: "Repeat... repeat the first word of every sentence." },
  },
  {
    id: 13,
    name: "Buzzer",
    primary_rule: { id: 1301, name: "Mirror Kiss", description: "Kiss the closest mirror.", special: 'BUZZER' },
    flipped_rule: { id: 1302, name: "Mirror Insult", description: "Tell yourself 'You suck!' in the closest mirror.", special: 'BUZZER' }
  }
];

export const prompts: Prompt[] = [
  { id: 401, text: "Name 5 character actors." },
  { id: 402, text: "Name 10 types of cheese." },
  { id: 403, text: "Explain photosynthesis." },
  { id: 404, text: "Recite a famous movie quote." },
  { id: 405, text: "Invent and define a new word." },
];

export const modifiers: Modifier[] = [
  { id: 501, type: 'LEFT', name: "Left", description: "Take one of your active rules and pass it to the person on your left." },
  { id: 502, type: 'RIGHT', name: "Right", description: "Take one of your active rules and pass it to the person on your right." },
  { id: 503, type: 'FLIP', name: "Flip", description: "Choose one of your active rules to flip to its alternate version." },
  { id: 504, type: 'CLONE', name: "Clone", description: "Clone one of your rules and give the copy to another player." },
];
