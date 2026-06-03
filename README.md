# Spin That Wheel

A companion site for playing a version of the game from [Dropout](https://dropout.tv)'s [Game Changer episode "Rulette"](https://www.dropout.tv/videos/rulette).

Spin a wheel of **Rules**, complete **Prompts** without breaking them, and keep score. Game content is fully editable, and any configuration can be shared via a link.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Upstash Redis** — stores shared game configurations
- **Genkit + Google Gemini** — optional AI generation of themed cards (admin only)
- Deployed on **Vercel**

## Local Setup

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:9002 (or the configured port)
```

`npm run build` creates a production build.

## Environment Variables

Create a `.env` file in the project root:

```
# Required — share links read/write here
KV_REST_API_URL="https://<your-db>.upstash.io"
KV_REST_API_TOKEN="your-upstash-rest-token"

# Optional — only used by the admin "Generate with AI" feature
GEMINI_API_KEY="your-gemini-api-key"
```

Without the Upstash variables the app still runs, but creating and loading share links will fail.

## How It Works

- It's a client-rendered SPA. Game state lives in React + the browser's `localStorage`.
- **`/admin`** ("Manage Cards") edits Rules, Prompts, Modifiers, the Golden Rule, scoring mode, and rules-per-game. Changes save to `localStorage`.
- **Share** posts the current configuration to `POST /api/shares`, which stores it in Redis under the key `share:{id}` and returns a URL like `/?share=<id>`. Opening that URL loads the config via `GET /api/shares/{id}`.
- Newer settings (Golden Rule, prompt scoring, rules-per-game) fall back to legacy-safe defaults when loading older links, so all existing share links keep working.

## Scripts

The `scripts/` folder is git-ignored and local-only (e.g., one-off migration/maintenance tools). Nothing in it ships with the app.

## Deployment

Pushing to `master` triggers an automatic production deploy on Vercel.
