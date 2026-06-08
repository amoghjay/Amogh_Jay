# Amogh Jayasimha Portfolio

Astro-based portfolio for Amogh Jayasimha, focused on platform engineering, DevOps, and site reliability work.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Cloudflare Workers deployment

This project is configured for Cloudflare Workers Static Assets through [`wrangler.jsonc`](./wrangler.jsonc).

Local deploy flow:

```bash
npm install
npm run build
npx wrangler deploy
```

Before the first deploy:

1. Authenticate with Cloudflare:

```bash
npx wrangler login
```

2. Optionally set a production site URL before building:

```bash
SITE_URL=https://your-domain.com npm run build
```

## Content model

Structured content lives in `src/data/` and is validated in `src/content.config.ts`.

- `profile.json`
- `featured-projects.json`
- `case-studies.json`
- `skills.json`
- `timeline.json`

## Deployment

GitHub Actions can deploy the site to Cloudflare Workers through [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
