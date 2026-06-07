# Amogh Jayasimha Portfolio

Astro-based GitHub Pages portfolio for Amogh Jayasimha, focused on platform engineering, DevOps, and site reliability work.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content model

Structured content lives in `src/data/` and is validated in `src/content.config.ts`.

- `profile.json`
- `featured-projects.json`
- `case-studies.json`
- `skills.json`
- `timeline.json`

## Deployment

The site deploys to GitHub Pages through [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).
