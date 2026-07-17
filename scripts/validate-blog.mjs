import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";

const root = join(process.cwd(), "src", "content", "blog");
const errors = [];
const warnings = [];

function collectMarkdownFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectMarkdownFiles(path) : path.endsWith(".md") ? [path] : [];
  });
}

function value(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, "") ?? "";
}

const files = collectMarkdownFiles(root);
const slugs = new Map();
const featured = [];

files.forEach((file) => {
  const label = relative(process.cwd(), file);
  const source = readFileSync(file, "utf8");
  const frontmatterMatch = source.match(/^---\s*\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    errors.push(`${label}: missing frontmatter block`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const title = value(frontmatter, "title");
  const description = value(frontmatter, "description");
  const pubDate = value(frontmatter, "pubDate");
  const tags = value(frontmatter, "tags");
  const draft = value(frontmatter, "draft") === "true";
  const isFeatured = value(frontmatter, "featured") === "true";
  const slug = relative(root, dirname(file)).replaceAll("\\", "/").replace(/\/$/, "");

  if (slugs.has(slug)) errors.push(`${label}: duplicate slug "${slug}" also used by ${slugs.get(slug)}`);
  else slugs.set(slug, label);

  if (!title) errors.push(`${label}: title is required`);
  if (!description) errors.push(`${label}: description is required`);
  if (!pubDate || Number.isNaN(Date.parse(pubDate))) errors.push(`${label}: pubDate must be a valid date`);
  if (!tags || tags === "[]") errors.push(`${label}: add at least one tag`);
  if (title.length > 90) warnings.push(`${label}: title is ${title.length} characters; consider keeping it under 90`);
  if (description && description.length < 40) warnings.push(`${label}: description is short (${description.length} characters)`);
  if (isFeatured && !draft) featured.push(label);

  for (const match of source.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    const [, alt, target] = match;
    if (!alt.trim()) errors.push(`${label}: image "${target}" needs descriptive alt text`);
  }

  if (!draft) {
    for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const rawTarget = match[1].trim().replace(/^<|>$/g, "");
      if (/^(https?:|mailto:|#|\/)/.test(rawTarget)) continue;
      const target = rawTarget.split(/[?#]/)[0];
      if (target && !existsSync(resolve(dirname(file), target))) {
        errors.push(`${label}: relative link target does not exist: ${rawTarget}`);
      }
    }
  }
});

if (featured.length > 1) errors.push(`Only one published post can be featured: ${featured.join(", ")}`);

warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`Error: ${error}`));
  process.exit(1);
}

console.log(`Validated ${files.length} blog Markdown files (${warnings.length} warnings).`);
