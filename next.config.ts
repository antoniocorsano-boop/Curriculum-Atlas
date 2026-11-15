import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const isAtlasPreviewRootScoped = process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true";
const repositoryName = "Curriculum-Atlas";

// A generated review checkout must never enter an ordinary or Pages build.
const reviewMarker = resolve(".atlas-energy-review-only");
const reviewRoute = resolve("src/app/revisione/energia");
const reviewPublic = resolve("public/revisione/energia");
const hasReviewOverlay = existsSync(reviewMarker) || existsSync(reviewRoute) || existsSync(reviewPublic);
const reviewBuild = process.env.ATLAS_REVIEW_BUILD === "true";
if (hasReviewOverlay || reviewBuild) {
  if (!reviewBuild || !isAtlasPreviewRootScoped || isGitHubPages ||
      !existsSync(reviewMarker) || !existsSync(reviewRoute) || existsSync(reviewPublic) ||
      readFileSync(reviewMarker, "utf8").trim() !== "ATLAS_ENERGIA_REVIEW_ONLY_V1") {
    throw new Error("ATLAS_REVIEW_BUILD_REQUIRED: review overlay cannot enter ordinary or Pages output");
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isGitHubPages || isAtlasPreviewRootScoped ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: isGitHubPages || isAtlasPreviewRootScoped,
  },
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
