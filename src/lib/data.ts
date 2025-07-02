
import type { RuleGroup, Prompt, Modifier } from './types';

export const ruleGroups: RuleGroup[] = [
  {
    id: 1,
    name: "Voice",
    primary_rule: { id: 101, name: "In a sing-song voice", description: "You must speak in a sing-song voice, lilting up and down." },
    flipped_rule: { id: 102, name: "Speak in a monotone voice", description: "You must speak in a monotone voice, with no inflection." },
  },
  {
    id: 2,
    name: "Speech",
    primary_rule: { id: 201, name: "No filler words", description: "You cannot use filler words (um, uh, like)." },
    flipped_rule: { id: 202, name: "Only use filler words", description: "You must use filler words in every sentence." },
  },
  {
    id: 3,
    name: "Language",
    primary_rule: { id: 301, name: "No cursing", description: "You are not allowed to curse or use swear words." },
    flipped_rule: { id: 302, name: "Must curse", description: "You must include a curse word in every sentence." },
  },
  {
    id: 4,
    name: "Impression",
    primary_rule: { id: 401, name: "Doing your best Christopher walker", description: "You must do your best Christopher walker impression." },
    flipped_rule: { id: 402, name: "Doing your worst Robert Deniro", description: "You must do your worst Robert Deniro impression." },
  },
  {
    id: 5,
    name: "Manner",
    primary_rule: { id: 501, name: "Speak very politely", description: "You must say everything very politely." },
    flipped_rule: { id: 502, name: "Speak very rudely", description: "You must say everything very rudely." },
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
    primary_rule: { id: 701, name: "Be allergic to jokes", description: "You are deathly allergic to jokes and must react accordingly." },
    flipped_rule: { id: 702, name: "Laugh at everything", description: "You must laugh hysterically at everything, funny or not." },
  },
  {
    id: 8,
    name: "Tone",
    primary_rule: { id: 801, name: "Sexily", description: "You must say everything in your sexiest voice." },
    flipped_rule: { id: 802, name: "Unsexily", description: "You must say everything in your most unsexy voice." },
  },
  {
    id: 9,
    name: "Facial Expression",
    primary_rule: { id: 901, name: "Don't show your teeth", description: "You cannot show your teeth while talking." },
    flipped_rule: { id: 902, name: "Always show your teeth", description: "You must always be showing your teeth." },
  },
  {
    id: 10,
    name: "Energy",
    primary_rule: { id: 1001, name: "Big energy at the end", description: "You must end every sentence with a burst of high energy." },
    flipped_rule: { id: 1002, name: "End with low energy", description: "You must end every sentence with very low, fading energy." },
  },
  {
    id: 11,
    name: "Nickname",
    primary_rule: { id: 1101, name: "Call everyone 'Big Dog'", description: "You must refer to every other player as 'Big Dog'." },
    flipped_rule: { id: 1102, name: "Use formal names", description: "You must refer to everyone by their formal, full name." },
  },
  {
    id: 12,
    name: "Repetition",
    primary_rule: { id: 1201, name: "Repeat the last word", description: "You must repeat the last word of every sentence... sentence." },
    flipped_rule: { id: 1202, name: "Repeat the first word", description: "Repeat... repeat the first word of every sentence." },
  },
  {
    id: 13,
    name: "Buzzer",
    primary_rule: { id: 1301, name: "Kiss the nearest mirror", description: "When the buzzer sounds, find and kiss the closest mirror.", special: 'BUZZER' },
    flipped_rule: { id: 1302, name: "Insult yourself in the mirror", description: "When the buzzer sounds, tell yourself 'You suck!' in the closest mirror.", special: 'BUZZER' }
  }
];

export const prompts: Prompt[] = [
  { id: 401, text: "Name 5 character actors in 30 seconds." },
  { id: 402, text: "Name 10 types of cheese in 60 seconds." },
  { id: 403, text: "Explain photosynthesis." },
  { id: 404, text: "Recite a famous movie quote." },
  { id: 405, text: "Invent and define a new word." },
  { id: 406, text: "Name 5 blue things in this room." },
  { id: 407, text: "say the ABCs" },
];

export const defaultBuzzerCountdown = 20;

export const modifiers: Modifier[] = [
  { id: 501, type: 'LEFT', name: "Left", description: "Take one of your active rules and pass it to the person on your left." },
  { id: 503, type: 'FLIP', name: "Flip", description: "Choose one of your active rules to flip to its alternate version." },
  { id: 504, type: 'CLONE', name: "Clone", description: "Clone one of your rules and give the copy to another player." },
  { id: 505, type: 'SWAP', name: "Swap", description: "Swap any rule with another player's rule." },
];
