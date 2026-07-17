import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const profile = defineCollection({
  loader: file("src/data/profile.json"),
  schema: z.object({
    name: z.string(),
    headline: z.string(),
    location: z.string(),
    shortBio: z.string(),
    longBio: z.string(),
    links: z.object({
      github: z.url(),
      linkedin: z.url(),
      email: z.email(),
      resumeUrl: z.url().optional()
    })
  })
});

const featuredProjects = defineCollection({
  loader: file("src/data/featured-projects.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    repo: z.string().nullable().optional(),
    summary: z.string(),
    problem: z.string(),
    approach: z.string(),
    impact: z.string(),
    stack: z.array(z.string()),
    status: z.string(),
    featured: z.boolean(),
    order: z.number(),
    proofPoints: z.array(z.string())
  })
});

const caseStudies = defineCollection({
  loader: file("src/data/case-studies.json"),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    challenge: z.string(),
    actions: z.array(z.string()),
    results: z.array(z.string()),
    tools: z.array(z.string())
  })
});

const skills = defineCollection({
  loader: file("src/data/skills.json"),
  schema: z.object({
    domains: z.array(
      z.object({
        name: z.string(),
        summary: z.string(),
        tools: z.array(z.string())
      })
    )
  })
});

const timeline = defineCollection({
  loader: file("src/data/timeline.json"),
  schema: z.object({
    org: z.string(),
    title: z.string(),
    start: z.string(),
    end: z.string(),
    location: z.string(),
    summary: z.string()
  })
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      projectId: z.string().optional(),
      series: z.object({
        name: z.string().min(1),
        part: z.number().int().positive(),
        total: z.number().int().positive()
      }).optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      canonicalUrl: z.url().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      externalUrl: z.url().optional(),
      externalLabel: z.string().optional()
    }).refine((post) => !post.cover || Boolean(post.coverAlt?.trim()), {
      message: "coverAlt is required when a cover image is provided",
      path: ["coverAlt"]
    }).refine((post) => !post.series || post.series.part <= post.series.total, {
      message: "series.part cannot be greater than series.total",
      path: ["series", "part"]
    })
});

export const collections = {
  profile,
  featuredProjects,
  caseStudies,
  skills,
  timeline,
  blog
};
