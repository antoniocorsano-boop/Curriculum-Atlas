import type { NextConfig } from "next";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const isAtlasPreviewRootScoped = process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true";
const repositoryName = "Curriculum-Atlas";
const basePath = isGitHubPages ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isGitHubPages || isAtlasPreviewRootScoped ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: isGitHubPages || isAtlasPreviewRootScoped,
  },
  basePath,
  env: { NEXT_PUBLIC_ATLAS_BASE_PATH: basePath },
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
