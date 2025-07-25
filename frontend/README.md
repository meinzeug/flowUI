# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.local.example` to `.env.local` and set `GEMINI_API_KEY` to your Gemini API key
3. Run the app:
   `npm run dev`

### Debugging React Errors

When the app is served in production mode, React errors are minified and shown only as codes like "Minified React error #185". Run the frontend in development mode to see the full stack trace:

```bash
npm run dev
```

Alternatively, append `?dev` to the import URLs in `index.html` to force the non-minified bundles.

If you see `net::ERR_CERT_COMMON_NAME_INVALID` for `/favicon.ico`, your local HTTPS certificate is likely misconfigured. Use HTTP during development or fix the certificate to remove the warning.

