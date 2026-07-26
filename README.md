<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/147485eb-6240-4bd1-805d-9b59104f534a

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` and other variables in [.env](.env):
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Connect your repository to Vercel.
2. Add the environment variables in Vercel:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, default `gpt-4.1-mini`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Set the build command to:
   `npm run build`
4. Vercel will use `vercel.json` to route SPA pages correctly and serve API routes from `api/*.ts`.
