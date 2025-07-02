
'use server';
/**
 * @fileOverview An AI flow for generating themed card content for the SPIN THAT WHEEL game.
 *
 * - generateCards - A function that takes a theme and existing card data to generate new content.
 * - GenerateCardsInput - The input type for the generateCards function.
 * - GenerateCardsOutput - The return type for the generateCards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';

// Zod Schemas matching lib/types.ts
const RuleSchema = z.object({
  id: z.number(),
  name: z.string().describe('A short, actionable phrase that summarizes the rule (e.g., "Speak like a pirate", "No laughing").'),
  description: z.string().describe('A brief (1-sentence) description that elaborates on the name.'),
  special: z.enum(['BUZZER']).optional().describe('A special flag for rules with unique game mechanics.'),
});

const RuleGroupSchema = z.object({
  id: z.number(),
  name: z.string().describe("The category of the rule, like 'Voice' or 'Manner'."),
  primary_rule: RuleSchema,
  flipped_rule: RuleSchema,
});

const PromptSchema = z.object({
  id: z.number(),
  text: z.string().describe('A short challenge or question for the player (under 10 words).'),
});

// Input and Output Schemas for the Flow
const GenerateCardsInputSchema = z.object({
  theme: z.string().describe('The theme for the new cards (e.g., "pirates", "space opera").'),
  existingRules: z.array(RuleGroupSchema).describe('An array of existing rule groups to use as a structural template.'),
  existingPrompts: z.array(PromptSchema).describe('An array of existing prompts to use as a structural template.'),
});
export type GenerateCardsInput = z.infer<typeof GenerateCardsInputSchema>;

const GenerateCardsOutputSchema = z.object({
  ruleGroups: z.array(RuleGroupSchema),
  prompts: z.array(PromptSchema),
});
export type GenerateCardsOutput = z.infer<typeof GenerateCardsOutputSchema>;


export async function generateCards(input: GenerateCardsInput): Promise<GenerateCardsOutput> {
  return generateCardsFlow(input);
}

const generationPrompt = ai.definePrompt({
  name: 'generateCardsPrompt',
  input: { schema: GenerateCardsInputSchema },
  output: { schema: GenerateCardsOutputSchema },
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are a creative and witty game designer for a party game called "SPIN THAT WHEEL".
Your task is to generate a new set of Rules and Prompts based on a user-provided theme: "{{theme}}".

**THE GAME**
This is a game where players try to complete challenges (Prompts) while adhering to the various rules they've been given. The difficulty of a Prompt is mostly about completing it without breaking any of the Rules. For example, a player might have to sing the ABCs (a Prompt) while not showing their teeth (a Rule). The funniest moments come from these difficult combinations.

**GUIDELINES**
- **Prompts:** Create verbal or physical challenges. Avoid prompts that would require a fact-checker. Keep them short and actionable.
- **Rules:** For each rule, you will also create a "flipped" version which is its thematic opposite. This flip can be literal (e.g., "Speak very politely" vs. "Speak very rudely") or more humorous (e.g., "Your best Christopher Walken" vs. "Your worst Robert DeNiro"). Players don't know what the flipped version is until they land on a "Flip" modifier, so make it a fun surprise!

**CRITICAL INSTRUCTIONS**
1.  **Generate BOTH Rules and Prompts:** Your output JSON MUST contain both a \`ruleGroups\` array and a \`prompts\` array. Do not omit either.
2.  **Match Quantities:** The number of new rule groups you generate MUST be exactly the same as the number of items in the \`existingRules\` example. The number of new prompts MUST match the number in the \`existingPrompts\` example.
3.  **Thematic Opposites:** For each rule group, the \`flipped_rule\` MUST be the thematic opposite of the \`primary_rule\`. This is a core game mechanic.
4.  **Inject Theme:** Creatively infuse the "{{theme}}" into the 'name' and 'description' of each Rule and the 'text' of each Prompt.
5.  **Preserve IDs:** Do NOT change the 'id' fields. Use the original IDs from the provided examples.
6.  **Be Practical:** Rules and prompts should be actions or speech patterns that a person can reasonably perform during a conversation.

Here are the existing cards to use as a template for structure, quantity, and IDs.

**Existing Content Examples:**
\`\`\`json
{
  "existingRules": {{{json existingRules}}},
  "existingPrompts": {{{json existingPrompts}}}
}
\`\`\`

Your response MUST be a valid JSON object that strictly adheres to the output schema. It must contain both \`ruleGroups\` and \`prompts\` keys inside a single JSON object. Do not add any text or explanation outside of the JSON.
`,
});

const generateCardsFlow = ai.defineFlow(
  {
    name: 'generateCardsFlow',
    inputSchema: GenerateCardsInputSchema,
    outputSchema: GenerateCardsOutputSchema,
  },
  async (input) => {
    const response = await generationPrompt(input);
    const { output } = response;

    if (!output) {
      const errorMessage = `AI failed to generate card data (output was null or empty). Raw Response: ${JSON.stringify(response, null, 2)}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (!output.ruleGroups || output.ruleGroups.length === 0) {
      const errorMessage = `AI generated prompts but failed to generate any rule groups. Raw Response: ${JSON.stringify(response, null, 2)}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return output;
  }
);
