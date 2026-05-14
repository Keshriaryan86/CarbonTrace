import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Genkit initialization file.
 * Configures the Google AI plugin and exports the singleton 'ai' instance.
 * It automatically uses the GOOGLE_GENAI_API_KEY environment variable.
 */

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
