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
It also includes a Worker route at `/api/contact` for the contact form popup.

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

3. Configure the contact form email route:

- Enable Email Routing for the domain in Cloudflare.
- Verify the destination inbox used by `send_email.destination_address` in `wrangler.jsonc`, currently `amoghjay.us@gmail.com`.
- Set `vars.CONTACT_FROM` to an address on that Email Routing domain, currently `contact@amoghjay.dev`.
- Set `vars.CONTACT_TO` and `send_email.destination_address` to the verified inbox that should receive form submissions.

The browser submits JSON to `/api/contact`; the Worker validates it and sends the message through the `CONTACT_EMAIL` Email Routing binding. The submitted email address is added as `Reply-To`, so replies go to the person who filled out the form.

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
