import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://amoghjay.dev");

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap-index.xml", origin)}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
};
