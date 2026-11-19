import type { NextConfig } from "next";
import { existsSync } from "node:fs";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const isAtlasPreviewRootScoped = process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true";
const repositoryName = "Curriculum-Atlas";

if (existsSync("public/atlas-gateway-native") && (process.env.ATLAS_GATEWAY_PREVIEW !== "true" || process.env.ATLAS_GATEWAY_NATIVE_PREVIEW !== "true" || isGitHubPages || (isAtlasPreviewRootScoped && process.env.ATLAS_LIBRARY_STATIC_PREVIEW !== "true"))) {
  throw new Error("Remove local native Gateway staging before a non-native or static export build.");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isGitHubPages || isAtlasPreviewRootScoped ? "export" : process.env.ATLAS_LIBRARY_WEB_DELIVERY === "true" ? "standalone" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: isGitHubPages || isAtlasPreviewRootScoped,
  },
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
