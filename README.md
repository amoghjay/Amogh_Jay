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

Structured content lives in `src/data/` and `src/content/blog/`, and is validated in `src/content.config.ts`.

- `profile.json`
- `featured-projects.json`
- `case-studies.json`
- `skills.json`
- `timeline.json`

## Blog writeups

Project writeups are local Markdown content collection entries. Use one folder per post:

Create a dated draft with the scaffolding command:

```bash
npm run new-post -- "How I Built the Release Gate"
```

The command generates `src/content/blog/how-i-built-the-release-gate/index.md` with starter sections and `draft: true`.

While `npm run dev` is running, drafts can be previewed directly at `/blog/<folder-name>/`. They are marked as local previews and are excluded from production builds, RSS, tag pages, and the sitemap until `draft` is changed to `false`.

```text
src/content/blog/my-project-writeup/
  index.md
  screenshot.png
```

Required frontmatter:

```md
---
title: "What I Built"
description: "One specific sentence about what the writeup explains."
pubDate: 2026-07-08
tags: ["Kubernetes", "Terraform"]
draft: false
---
```

Optional frontmatter:

- `featured: true` pins a post as the lead item on `/blog/`.
- `updatedDate` adds modified-date metadata.
- `canonicalUrl` points search engines to an original publication.
- `cover` and required `coverAlt` add article and social imagery.

Screenshots use standard Markdown image syntax:

```md
![What this screenshot proves](./screenshot.png)
```

Code snippets use fenced blocks with language names:

````md
```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
```
````

Keep writeups personal and specific: why you built it, what felt wrong in the first version, what design you settled on, what the screenshots prove, and what you would improve next. The hidden draft at `src/content/blog/project-writeup-template/index.md` is a starter template.

Published posts automatically appear in:

- `/rss.xml` for RSS readers.
- `/sitemap-index.xml` for search engines.
- `/blog/tags/<tag>/` topic archives.

Article pages include Shiki syntax highlighting, code-copy controls, a scroll-aware table of contents, image captions/full-size viewing, related posts, and newer/older navigation.

Validate all Markdown posts before publishing:

```bash
npm run validate:blog
```

The validator checks required metadata, dates, tags, duplicate slugs, featured-post conflicts, image alt text, and missing local links. It also runs automatically as part of `npm run check` and `npm run build`.

## Deployment

GitHub Actions can deploy the site to Cloudflare Workers through [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
