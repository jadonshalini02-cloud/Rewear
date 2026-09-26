<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/848d1be1-3537-4118-814e-11bb0caada3a

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Neon / Vercel Production Setup

Add the Neon connection string as `DATABASE_URL` in Vercel Project Settings for Production, Preview, and Development. Then run the explicit schema migration from a local terminal:

```bash
npm install
DATABASE_URL="postgresql://...neon.tech/...?..." npm run db:migrate
```

The migration creates the `rewear_state` JSONB table used by the existing application data layer. On the first production request, the app automatically seeds the initial ReWear dataset if that table is empty. Set `JWT_SECRET` to a long production-only secret and keep `BLOB_READ_WRITE_TOKEN` enabled for persistent listing images.
