import type { NextConfig } from "next";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const repositoryName = "Curriculum-Atlas";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: isGitHubPages,
  },
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
