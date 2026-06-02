import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDir = path.join(rootDir, "dist");
const pagesDir = path.join(rootDir, "src", "pages");
const publicDir = path.join(rootDir, "public");
const engpassPagesPath = path.join(
  rootDir,
  "src",
  "data",
  "engpassLandingPages.ts",
);

const missing = [];
const ignoredPublicFiles = new Set([".DS_Store"]);

const relative = (filePath) => path.relative(rootDir, filePath);

const toPosix = (filePath) => filePath.split(path.sep).join("/");

const writeLine = (stream, message) => {
  stream.write(`${message}\n`);
};

const assertExists = (category, sourcePath, outputPath) => {
  if (!existsSync(outputPath)) {
    missing.push({
      category,
      source: relative(sourcePath),
      output: relative(outputPath),
    });
  }
};

const listFiles = (dir) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
};

if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
  writeLine(
    process.stderr,
    "[verify-build-output] Missing dist/. Run `npm run build` first.",
  );
  process.exit(1);
}

const pageFiles = listFiles(pagesDir);

const staticPageOutputs = pageFiles
  .filter((filePath) => filePath.endsWith(".astro"))
  .filter((filePath) => !toPosix(relative(filePath)).includes("["))
  .map((filePath) => {
    const pageRelativePath = toPosix(path.relative(pagesDir, filePath));
    const routePath = pageRelativePath
      .replace(/\/index\.astro$/, ".html")
      .replace(/\.astro$/, ".html");

    return {
      sourcePath: filePath,
      outputPath: path.join(distDir, ...routePath.split("/")),
    };
  });

for (const { sourcePath, outputPath } of staticPageOutputs) {
  assertExists("static route", sourcePath, outputPath);
}

const apiOutputs = pageFiles
  .filter((filePath) =>
    toPosix(path.relative(pagesDir, filePath)).startsWith("api/"),
  )
  .filter((filePath) => /\.(js|ts|mjs|mts|cjs|cts)$/.test(filePath))
  .map((filePath) => {
    const apiRelativePath = toPosix(path.relative(pagesDir, filePath)).replace(
      /\.[cm]?[jt]s$/,
      "",
    );

    return {
      sourcePath: filePath,
      outputPath: path.join(distDir, ...apiRelativePath.split("/")),
    };
  });

for (const { sourcePath, outputPath } of apiOutputs) {
  assertExists("api route", sourcePath, outputPath);
}

const engpassSource = readFileSync(engpassPagesPath, "utf8");
const engpassSlugs = [...engpassSource.matchAll(/slug:\s*"([^"]+)"/g)].map(
  ([, slug]) => slug,
);

for (const slug of engpassSlugs) {
  assertExists(
    "dynamic engpass route",
    engpassPagesPath,
    path.join(distDir, `${slug}.html`),
  );
}

const requiredSeoOutputs = [
  {
    source: "public/robots.txt",
    output: "robots.txt",
  },
  {
    source: "astro.config.mjs",
    output: "sitemap-index.xml",
  },
];

for (const { source, output } of requiredSeoOutputs) {
  assertExists(
    "seo file",
    path.join(rootDir, source),
    path.join(distDir, output),
  );
}

const sitemapFiles = listFiles(distDir)
  .map((filePath) => path.relative(distDir, filePath))
  .filter((filePath) => /^sitemap-\d+\.xml$/.test(toPosix(filePath)));

if (sitemapFiles.length === 0) {
  missing.push({
    category: "seo file",
    source: "astro.config.mjs",
    output: "dist/sitemap-*.xml",
  });
}

const robotsPath = path.join(distDir, "robots.txt");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");

  if (!robots.includes("sitemap-index.xml")) {
    missing.push({
      category: "seo reference",
      source: "public/robots.txt",
      output: "dist/robots.txt must reference sitemap-index.xml",
    });
  }
}

const sitemapIndexPath = path.join(distDir, "sitemap-index.xml");
if (existsSync(sitemapIndexPath)) {
  const sitemapIndex = readFileSync(sitemapIndexPath, "utf8");

  if (!/sitemap-\d+\.xml/.test(sitemapIndex)) {
    missing.push({
      category: "seo reference",
      source: "dist/sitemap-index.xml",
      output: "dist/sitemap-index.xml must reference a sitemap-*.xml child",
    });
  }
}

const publicFiles = listFiles(publicDir).filter(
  (filePath) => !ignoredPublicFiles.has(path.basename(filePath)),
);

for (const sourcePath of publicFiles) {
  const publicRelativePath = path.relative(publicDir, sourcePath);
  assertExists(
    "public asset",
    sourcePath,
    path.join(distDir, ...publicRelativePath.split(path.sep)),
  );
}

if (missing.length > 0) {
  writeLine(
    process.stderr,
    "[verify-build-output] Missing expected build outputs:",
  );

  for (const item of missing) {
    writeLine(
      process.stderr,
      `- ${item.category}: ${item.source} -> ${item.output}`,
    );
  }

  process.exit(1);
}

writeLine(
  process.stdout,
  [
    "[verify-build-output] OK:",
    `${staticPageOutputs.length} static routes,`,
    `${apiOutputs.length} API routes,`,
    `${engpassSlugs.length} dynamic engpass routes,`,
    `${publicFiles.length} public files,`,
    `${sitemapFiles.length} child sitemap(s).`,
  ].join(" "),
);
