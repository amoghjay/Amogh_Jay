import { defineConfig } from "astro/config";

const repository = process.env.GITHUB_REPOSITORY ?? "";
const [owner = "amoghjay", repo = "amoghjay.github.io"] = repository.split("/");
const isUserSite = repo === `${owner}.github.io`;
const base = process.env.SITE_BASE ?? (isUserSite ? "/" : `/${repo}/`);

export default defineConfig({
  output: "static",
  site: `https://${owner}.github.io`,
  base,
  build: {
    inlineStylesheets: "auto"
  }
});
