
import type { RuleGroup, Prompt, Modifier } from './types';

export const ruleGroups: RuleGroup[] = [
  {
    id: 1,
    name: "Voice",
    primary_rule: { id: 101, name: "In a sing-song voice", description: "You must speak in a sing-song voice" },
    flipped_rule: { id: 102, name: "Speak in a monotone voice", description: "You must speak in a monotone voice, with no inflection." },
  },
  {
    id: 2,
    name: "Speech",
    primary_rule: { id: 201, name: "No filler words", description: "You cannot use filler words (um, uh, like)." },
    flipped_rule: { id: 202, name: "Full Valley Girl", description: "You must, like, totally speak like a Valley Girl." },
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
    primary_rule: { id: 401, name: "Doing your best Christopher Walken", description: "You must do your best Christopher Walken impression." },
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
    primary_rule: { id: 701, name: "Be allergic to jokes", description: "You must sneeze at everyone's jokes." },
    flipped_rule: { id: 702, name: "Laugh at everything", description: "You must laugh at everything, funny or not." },
  },
  {
    id: 8,
    name: "Tone",
    primary_rule: { id: 801, name: "Sexily", description: "You speak and act sexily." },
    flipped_rule: { id: 802, name: "Unsexily", description: "You must speak and act in the most unsexy way." },
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
    primary_rule: { id: 1101, name: "Call everyone 'Big Dog'", description: "You must refer to everyone as 'Big Dog'." },
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
  },
  {
    id: 14,
    name: "Salutation",
    primary_rule: { id: 1401, name: "Start with 'What's up YouTube'", description: "You must start every sentence with 'What's up YouTube'." },
    flipped_rule: { id: 1402, name: "End with 'Like and Subscribe'", description: "You must end every sentence with '...like and subscribe!'" },
  },
  {
    id: 15,
    name: "Tongue & Hips",
    primary_rule: { id: 1501, name: "Lots of tongue action", description: "You must incorporate exaggerated tongue movements while speaking." },
    flipped_rule: { id: 1502, name: "Hip action", description: "You must incorporate exaggerated hip movements while speaking." },
  },
  {
    id: 16,
    name: "Invisible Exercise",
    primary_rule: { id: 1601, name: "Invisible hula hoop", description: "You must hula hoop an invisible hula hoop at all times." },
    flipped_rule: { id: 1602, name: "Invisible treadmill", description: "You must walk on an invisible treadmill at all times." },
  },
  {
    id: 17,
    name: "Word Length",
    primary_rule: { id: 1701, name: "Monosyllabically", description: "You can only use one-syllable words." },
    flipped_rule: { id: 1702, name: "Loquaciously", description: "You must use the longest words possible — no short words allowed." },
  },
  {
    id: 18,
    name: "Character",
    primary_rule: { id: 1801, name: "As a sexy baby", description: "You must speak and act as a sexy baby." },
    flipped_rule: { id: 1802, name: "As a sycophantic LLM", description: "You must speak like an overly agreeable AI assistant. 'Great question! I'd be happy to help!'" },
  },
  {
    id: 19,
    name: "Accent",
    primary_rule: { id: 1901, name: "Transatlantic accent", description: "You must speak in a Transatlantic accent." },
    flipped_rule: { id: 1902, name: "Vaguely European accent", description: "You must speak in a vaguely European accent of indeterminate origin." },
  },
  {
    id: 20,
    name: "Directing",
    primary_rule: { id: 2001, name: "Direct an invisible camera crew", description: "You must periodically direct an invisible camera crew while speaking." },
    flipped_rule: { id: 2002, name: "Boss around an invisible assistant", description: "You must periodically boss around an invisible personal assistant." },
  },
  {
    id: 21,
    name: "Daddy's Home",
    primary_rule: { id: 2101, name: "Say 'daddy's home' upon whistle", description: "When the referee blows the whistle, you must say 'daddy's home'." },
    flipped_rule: { id: 2102, name: "Say 'daddy's home, meow' with cat swipe upon whistle", description: "When the referee blows the whistle, you must say 'daddy's home, meow' with a cat swipe." },
  },
  {
    id: 22,
    name: "Airpods",
    primary_rule: { id: 2201, name: "Remove airpods before speaking", description: "You must mime removing airpods every time before you speak." },
    flipped_rule: { id: 2202, name: "Talking over airpods", description: "You must act like you can't hear anyone because your airpods are in." },
  },
  {
    id: 23,
    name: "Ending Move",
    primary_rule: { id: 2301, name: "End with cool move", description: "You must end every turn with a cool move or pose." },
    flipped_rule: { id: 2302, name: "End with gaffe", description: "You must end every turn by fumbling or tripping over something." },
  },
  {
    id: 24,
    name: "Point Reactions",
    primary_rule: { id: 2401, name: "High five yourself upon point", description: "You must high five yourself whenever you score a point." },
    flipped_rule: { id: 2402, name: "Hiss upon anyone else's point", description: "You must hiss whenever anyone else scores a point." },
  },
  {
    id: 25,
    name: "Full Name",
    primary_rule: { id: 2501, name: "End with famous full name", description: "You must end every sentence with a famous person's full name. No repeats." },
    flipped_rule: { id: 2502, name: "End with non-famous full name", description: "You must end every sentence with a random non-famous full name you make up." },
  },
  {
    id: 26,
    name: "Honorifics",
    primary_rule: { id: 2601, name: "Call everyone 'His Majesty the Big Man [name]'", description: "You must refer to everyone as 'His Majesty the Big Man' followed by their name." },
    flipped_rule: { id: 2602, name: "Call everyone 'Girth McFuck'", description: "You must refer to everyone as 'Girth McFuck'." },
  },
  {
    id: 27,
    name: "Touch Reaction",
    primary_rule: { id: 2701, name: "Say 'boop!' upon any touch", description: "You must say 'boop!' whenever anyone is touched by anyone." },
    flipped_rule: { id: 2702, name: "Say 'cooties!' upon any touch", description: "You must say 'cooties!' whenever anyone is touched by anyone." },
  },
  {
    id: 28,
    name: "Speaker Respect",
    primary_rule: { id: 2801, name: "Curtsy to speakers", description: "You must curtsy whenever someone else starts speaking." },
    flipped_rule: { id: 2802, name: "Flip off speakers", description: "You must flip off whoever is speaking." },
  },
  {
    id: 29,
    name: "Punctuation",
    primary_rule: { id: 2901, name: "Say all punctuation", description: "You must say all punctuation out loud. Period. Question mark." },
    flipped_rule: { id: 2902, name: "Say all punctuation wrong", description: "You must say punctuation out loud but always use the wrong one. Question mark instead of period, etc." },
  },
  {
    id: 30,
    name: "Name Reaction",
    primary_rule: { id: 3001, name: "'Who, me?' upon name", description: "Whenever someone says your name, you must say 'Who, me?'" },
    flipped_rule: { id: 3002, name: "'Uh-oh' upon name", description: "Whenever someone says your name, you must say 'Uh-oh'." },
  },
  {
    id: 31,
    name: "Freeze",
    primary_rule: { id: 3101, name: "Frozen unless speaking", description: "You must be completely frozen and still unless you are speaking." },
    flipped_rule: { id: 3102, name: "Frozen when speaking", description: "You must be completely frozen and still whenever you are speaking." },
  },
  {
    id: 32,
    name: "Ending Punctuation",
    primary_rule: { id: 3201, name: "End with butt slap", description: "You must end every turn with a butt slap." },
    flipped_rule: { id: 3202, name: "End with meow & swipe", description: "You must end every turn with a 'meow' and a cat swipe." },
  },
  {
    id: 33,
    name: "Hand Gestures",
    primary_rule: { id: 3301, name: "Jazz hands", description: "You must do jazz hands all the time." },
    flipped_rule: { id: 3302, name: "Heart hands", description: "You must make heart hands all the time." },
  },
  {
    id: 34,
    name: "Eye Contact",
    primary_rule: { id: 3401, name: "No eye contact", description: "You cannot make eye contact with anyone." },
    flipped_rule: { id: 3402, name: "Intense eye contact", description: "You must maintain intense, unbroken eye contact with whoever you're addressing." },
  },
  {
    id: 35,
    name: "Complaining",
    primary_rule: { id: 3501, name: "No complaining", description: "You are not allowed to complain about anything, no matter what." },
    flipped_rule: { id: 3502, name: "Always complaining", description: "You must complain about something in every sentence." },
  },
  {
    id: 36,
    name: "Consciousness",
    primary_rule: { id: 3601, name: "Start by gasping awake", description: "You must start every turn by gasping awake as if startled from sleep." },
    flipped_rule: { id: 3602, name: "End by nodding off", description: "You must end every turn by nodding off to sleep." },
  },
];

export const prompts: Prompt[] = [
  { id: 401, text: "Name 5 character actors in 30 seconds." },
  { id: 402, text: "Name 10 types of cheese in 60 seconds." },
  { id: 403, text: "Explain photosynthesis." },
  { id: 404, text: "Recite a famous movie quote." },
  { id: 405, text: "Invent and define a new word." },
  { id: 406, text: "Name 5 blue things in this room." },
  { id: 407, text: "say the ABCs" },
  { id: 408, text: "Name 10 [color] foods in 60 seconds." },
  { id: 409, text: "Recite the Star Spangled Banner." },
  { id: 410, text: "Call a friend for 60 seconds." },
  { id: 411, text: "Defend Astrology for 60 seconds." },
  { id: 412, text: "Name 8 movies that start with '[letter]' in 60 seconds." },
  { id: 413, text: "Name 10 Shakespeare plays in 60 seconds." },
];

export const defaultBuzzerCountdown = 20;

export const defaultGoldenRule: RuleGroup = {
  id: 9999,
  name: "Golden Rule",
  primary_rule: { id: 99901, name: "Play Nice", description: "Everyone must play nice — no trash talk, no sabotage, no meanness." },
  flipped_rule: { id: 99902, name: "Play Mean", description: "Everyone must play mean — trash talk, sabotage, and ruthlessness are encouraged." },
};

export const modifiers: Modifier[] = [
  { id: 501, type: 'LEFT', name: "Left", description: "Take one of your active rules and pass it to the person on your left." },
  { id: 503, type: 'FLIP', name: "Flip", description: "Choose one of your active rules to flip to its alternate version." },
  { id: 504, type: 'CLONE', name: "Clone", description: "Clone one of your rules and give the copy to another player." },
  { id: 505, type: 'SWAP', name: "Swap", description: "Swap any rule with another player's rule." },
  { id: 506, type: 'AUSTRALIA', name: "Australia", description: "Everything flips! All rules (and the Golden Rule) flip to their alternate version — already-flipped rules flip back. Also: everyone must speak in their best Australian accent for the rest of the game." },
  { id: 507, type: 'FREAKY_FRIDAY', name: "Freaky Friday", description: "Pick another player and swap ALL the rules on your body with theirs." },
];
