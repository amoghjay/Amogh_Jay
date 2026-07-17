import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL ?? "https://amoghjay.dev",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      },
      defaultColor: false
    }
  },
  build: {
    inlineStylesheets: "auto"
  }
});
