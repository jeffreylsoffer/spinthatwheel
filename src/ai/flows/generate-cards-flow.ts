'use server';
/**
 * @fileOverview An AI flow for generating themed card content for the SPIN THAT WHEEL game.
 *
 * - generateCards - A function that takes a theme and existing card data to generate new content.
 * - GenerateCardsInput - The input type for the generateCards function.
 * - GenerateCardsOutput - The return type for the generateCards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';

// Zod Schemas matching lib/types.ts
const RuleSchema = z.object({
  id: z.number(),
  name: z.string().describe('A short, catchy name for the rule (2-3 words).'),
  description: z.string().describe('A brief (1-sentence) description of what the player must do.'),
});

const RuleGroupSchema = z.object({
  id: z.number(),
  name: z.string().describe("The category of the rule, like 'Voice' or 'Manner'."),
  primary_rule: RuleSchema,
  flipped_rule: RuleSchema.describe('The alternate version of the primary rule.'),
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
  prompt: `You are a creative and witty game designer for a party game called "SPIN THAT WHEEL".
Your task is to generate a new set of Rules and Prompts based on a user-provided theme: "{{theme}}". The Modifiers are evergreen and should not be changed.

You must follow these instructions carefully:
1.  **Maintain Structure:** Use the provided existing cards as a template for the structure and quantity of new cards. The number of new rule groups and prompts should be the same as the number of existing ones.
2.  **Preserve Mechanics:** Flipped rules should be the thematic opposite of their primary rule.
3.  **Inject Theme:** Creatively infuse the "{{theme}}" into the 'name' and 'description' of each Rule and the 'text' of each Prompt. Be clever and funny.
4.  **Keep IDs:** Do NOT change the 'id' fields. Preserve the original IDs from the existing cards.

Here are the existing cards for reference:
- Rules: {{{json existingRules}}}
- Prompts: {{{json existingPrompts}}}

Now, generate a new set of themed Rules and Prompts. Your response MUST be a valid JSON object matching the output schema.
`,
});

const generateCardsFlow = ai.defineFlow(
  {
    name: 'generateCardsFlow',
    inputSchema: GenerateCardsInputSchema,
    outputSchema: GenerateCardsOutputSchema,
  },
  async (input) => {
    const { output } = await generationPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate card data.');
    }
    return output;
  }
);
