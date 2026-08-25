# EximNova Web

Production frontend for EximNova, designed to run on Cloudflare and consume the EximNova API Worker.

## Production API

`https://eximnova-api.innovatorsworldteam.workers.dev`

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The application is intentionally API-first. D1 and R2 are never accessed directly from the browser.
