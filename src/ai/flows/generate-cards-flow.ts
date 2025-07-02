
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
  prompt: `You are a creative and witty game designer for a party game called "SPIN THAT WHEEL".
Your task is to generate a new set of Rules and Prompts based on a user-provided theme: "{{theme}}".

You will be given existing rule groups and prompts as a template. Your goal is to create new content that matches the quantity and structure of the examples provided, but with the new theme applied.

**CRITICAL INSTRUCTIONS:**
1.  **Generate BOTH Rules and Prompts:** Your output JSON MUST contain both a \`ruleGroups\` array and a \`prompts\` array. Do not omit either.
2.  **Match Quantities:** The number of new rule groups you generate MUST be exactly the same as the number of items in the \`existingRules\` example. The number of new prompts MUST match the number in the \`existingPrompts\` example.
3.  **Thematic Opposites:** For each rule group, the \`flipped_rule\` MUST be the thematic opposite of the \`primary_rule\`. This is a core game mechanic.
4.  **Inject Theme:** Creatively infuse the "{{theme}}" into the 'name' and 'description' of each Rule and the 'text' of each Prompt.
5.  **Preserve IDs:** Do NOT change the 'id' fields. Use the original IDs from the provided examples.
6.  **Be Practical:** Rules and prompts should be actions or speech patterns that a person can reasonably perform during a conversation.

Here are the existing cards to use as a template. Use their structure, quantity, and IDs for your new themed content.

**Existing Content Examples:**
\`\`\`json
{
  "existingRules": {{{json existingRules}}},
  "existingPrompts": {{{json existingPrompts}}}
}
\`\`\`

Now, generate the new themed content. Your response MUST be a valid JSON object matching the output schema, containing both \`ruleGroups\` and \`prompts\` keys.
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
    if (!output.ruleGroups || output.ruleGroups.length === 0) {
      console.error("AI returned no rule groups. Full output:", output);
      throw new Error('AI failed to generate any rule groups. It may have only returned prompts.');
    }
    return output;
  }
);
