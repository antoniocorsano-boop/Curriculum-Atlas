import type { NextConfig } from "next";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const isAtlasPreviewRootScoped = process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true";
const repositoryName = "Curriculum-Atlas";

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
