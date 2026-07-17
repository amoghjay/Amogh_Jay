import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Usage: npm run new-post -- "Post title"');
  process.exit(1);
}

const slug = title
  .normalize("NFKD")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

if (!slug) {
  console.error("The title must contain at least one letter or number.");
  process.exit(1);
}

const postDirectory = join(process.cwd(), "src", "content", "blog", slug);
const postFile = join(postDirectory, "index.md");

if (existsSync(postFile)) {
  console.error(`A post already exists at ${postFile}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const escapedTitle = title.replaceAll('"', '\\"');
const template = `---
title: "${escapedTitle}"
description: "Replace this with one specific sentence about the writeup."
pubDate: ${today}
tags: ["Platform Engineering"]
featured: false
draft: true
---

## What I Was Trying To Prove

Explain the concrete question or operational problem that started the project.

## What I Tried First

Describe the first version and what it taught you.

## What Felt Wrong

Name the limitation, failure mode, or tradeoff that changed your direction.

## The Design I Settled On

Walk through the final architecture and the decisions that mattered.

## Key Code Or Config

\`\`\`yaml
# Replace with a focused, real example.
\`\`\`

## Result

State the proof: what became faster, safer, clearer, or easier to operate?

## What I Would Improve Next

Close with the remaining tradeoffs and the next experiment.
`;

mkdirSync(postDirectory, { recursive: true });
writeFileSync(postFile, template, "utf8");

console.log(`Created draft: ${postFile}`);
