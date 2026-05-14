'use server';
/**
 * @fileOverview Optimized Genkit flow for activity analysis.
 * Uses gemini-2.5-flash for reliability and performance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ActivityCategorySchema = z.enum([
  'transportation',
  'electricity_usage',
  'food_consumption',
  'shopping_lifestyle',
  'other',
]);

const AiAssistedActivityLoggingInputSchema = z.object({
  activityDescription: z.string().describe('The natural language description of the activity.'),
});
export type AiAssistedActivityLoggingInput = z.infer<typeof AiAssistedActivityLoggingInputSchema>;

const AiAssistedActivityLoggingOutputSchema = z.object({
  category: ActivityCategorySchema.describe('Broad category of the activity.'),
  activityName: z.string().describe('A concise, user-friendly name for the activity (e.g., "Drive to Work").'),
  itemName: z.string().toLowerCase().describe('The specific item key that matches the emission database.'),
  quantity: z.number().describe('The numerical value of the activity.'),
  unit: z.enum(['g', 'kg', 'km', 'mile', 'hour', 'kwh', 'serving']).describe('The unit of measurement.'),
  reasoning: z.string().describe('Brief explanation of how the data was extracted.'),
});
export type AiAssistedActivityLoggingOutput = z.infer<typeof AiAssistedActivityLoggingOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiAssistedActivityLoggingPrompt',
  input: {schema: AiAssistedActivityLoggingInputSchema},
  output: {schema: AiAssistedActivityLoggingOutputSchema},
  model: googleAI.model('gemini-2.5-flash'),
  config: {
    temperature: 0.1,
    maxOutputTokens: 300,
  },
  prompt: `You are a carbon footprint expert. Analyze the activity description and extract structured data.

Description: "{{{activityDescription}}}"

OUTPUT RULES:
1. itemName: beef, lamb, pork, chicken, fish, cheese, eggs, rice, tofu, vegetables, fruits, coffee, milk, petrol car, diesel car, electric car, bus, train, domestic flight, short-haul flight, long-haul flight, electricity, cotton t-shirt, jeans, laptop.
2. unit: g, kg, km, mile, hour, kwh, serving.
3. quantity: Extracted numerical value. Default to 1.
4. category: transportation, food_consumption, electricity_usage, shopping_lifestyle, other.`,
});

export async function aiAssistedActivityLogging(
  input: AiAssistedActivityLoggingInput
): Promise<AiAssistedActivityLoggingOutput> {
  const {output} = await prompt(input);
  if (!output) {
    throw new Error('AI generated an empty response.');
  }
  return output;
}
