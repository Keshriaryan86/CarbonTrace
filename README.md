
# CarbonTrace

This is a NextJS starter in Firebase Studio.

## Architecture

An overview of the system architecture can be found in [`docs/architecture.md`](./docs/architecture.md). This diagram explains how the frontend, backend, and AI services all work together.

## Deployment & Security

When deploying this application or pushing to GitHub, ensure you follow these security practices:

- **Environment Variables**: Sensitive keys (like your Google Gemini API Key) are stored in a `.env` file. This file is listed in `.gitignore` and will NOT be pushed to GitHub.
- **Required Variable**: Set `GOOGLE_GENAI_API_KEY` in your hosting provider's environment settings (e.g., Vercel, Firebase App Hosting).
- **Firebase Config**: The configuration in `src/firebase/config.ts` contains public identification keys which are safe to commit.

## Development

1. Copy `.env.example` to `.env` (if provided) or create a `.env` file.
2. Add your `GOOGLE_GENAI_API_KEY`.
3. Run `npm run dev`.

Built for a transparent and secure future.
