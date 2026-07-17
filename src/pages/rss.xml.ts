import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getPostSlug, getPublishedBlogPosts } from "../lib/blog";

export const GET: APIRoute = async (context) => {
  const posts = getPublishedBlogPosts(await getCollection("blog"));

  return rss({
    title: "Amogh Jayasimha — Project Blog",
    description: "Project writeups on platform engineering, Kubernetes, GitOps, reliability, and infrastructure decisions.",
    site: context.site ?? "https://amoghjay.dev",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${getPostSlug(post)}/`,
      categories: post.data.tags
    })),
    customData: "<language>en-us</language>"
  });
};
