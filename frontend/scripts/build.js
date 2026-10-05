const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const siteUrl =
  process.env.REACT_APP_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";
process.env.REACT_APP_SITE_URL = (
  siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`
).replace(/\/+$/, "");

const cracoBin = require.resolve("@craco/craco/dist/bin/craco.js");
const build = spawnSync(process.execPath, [cracoBin, "build"], {
  env: process.env,
  stdio: "inherit",
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const outputDir = path.resolve(__dirname, "../build");
const xmlEscape = (value) =>
  value.replace(/[<>&"']/g, (character) => {
    const entities = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" };
    return entities[character];
  });
const sitemapPaths = [
  "/",
  "/projects/airbus",
  "/projects/agent",
  "/projects/fin-advisor",
  "/projects/mapmynotes",
  "/projects/bone-age",
  "/projects/iot-actuator",
  "/projects/jobhunt",
  "/projects/weather-mcp",
  "/projects/fake-news",
  "/projects/typing-game",
];

fs.writeFileSync(
  path.join(outputDir, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /stats\nSitemap: ${process.env.REACT_APP_SITE_URL}/sitemap.xml\n`,
);
fs.writeFileSync(
  path.join(outputDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths
    .map((route) => `<url><loc>${xmlEscape(`${process.env.REACT_APP_SITE_URL}${route}`)}</loc></url>`)
    .join("")}</urlset>\n`,
);
