import type { NextConfig } from "next";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const repositoryName = "Curriculum-Atlas";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
