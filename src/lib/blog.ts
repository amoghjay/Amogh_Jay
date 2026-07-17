import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export function getPostSlug(post: BlogPost) {
  return post.id.replace(/\/index$/, "");
}

export function getPublishedBlogPosts(posts: BlogPost[]) {
  return posts
    .filter((post) => post.data.draft !== true)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function slugifyTag(tag: string) {
  return tag
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getBlogTags(posts: BlogPost[]) {
  const tags = new Map<string, string>();

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => tags.set(slugifyTag(tag), tag));
  });

  return [...tags.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getRelatedBlogPosts(post: BlogPost, posts: BlogPost[], limit = 3) {
  const tags = new Set(post.data.tags.map((tag) => tag.toLowerCase()));

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      score: candidate.data.tags.filter((tag) => tags.has(tag.toLowerCase())).length
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map(({ post: relatedPost }) => relatedPost);
}

export function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function estimateReadingTime(body = "") {
  const readableBody = body
    // Only strip frontmatter when it is the very first block. With multiline mode,
    // ordinary Markdown dividers could erase everything between two `---` lines.
    .replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "");
  const words = readableBody.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}
