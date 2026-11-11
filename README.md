# quick_choose_buttonsDY

A demo page that gets quick-choose deposit buttons from a Dynamic Yield (DY) campaign. It sends `maxDepositLimit` to DY as a page attribute. A small Node server forwards the request to DY's server-side `choose` API, so the API key never reaches the browser.

## Setup

1. Get a **server-side API key** from Dynamic Yield: **Settings → API Keys → Create key → Server-side**.
2. Copy the example env file and add your key:

   ```sh
   cp .env.example .env
   ```

   ```
   DY_API_KEY=your-server-side-key
   DY_API_BASE=https://dy-api.com/v2   # use https://dy-api.eu/v2 for EU sections
   DY_CAMPAIGN=jhcampaign-custom-deposit
   ```

3. Run it locally (requires Node 18+):

   ```sh
   node server.mjs
   ```

   Open http://localhost:5180.

`.env` is git-ignored, so don't commit your key.

## Deploying (optional)

`api/choose.mjs` is a serverless function for Vercel or similar hosts. Set `DY_API_KEY` (and optionally `DY_API_BASE` / `DY_CAMPAIGN`) as environment variables on the host.
