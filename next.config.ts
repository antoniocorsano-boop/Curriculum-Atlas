import type { NextConfig } from "next";
import { existsSync } from "node:fs";

const isGitHubPages = process.env.ATLAS_GITHUB_PAGES === "true";
const isAtlasPreviewRootScoped = process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true";
const repositoryName = "Curriculum-Atlas";

if (existsSync("public/atlas-gateway-native") && (process.env.ATLAS_GATEWAY_PREVIEW !== "true" || process.env.ATLAS_GATEWAY_NATIVE_PREVIEW !== "true" || isGitHubPages || (isAtlasPreviewRootScoped && process.env.ATLAS_LIBRARY_STATIC_PREVIEW !== "true"))) {
  throw new Error("Remove local native Gateway staging before a non-native or static export build.");
}

// P3B has a real GLB only in a manually staged PRIVATE laboratory build.
// Reject accidental use of these assets in the default/static/public pipeline.
if (existsSync("public/atlas-p3b-preview")
    && (process.env.ATLAS_P3B_PRIVATE_PREVIEW !== "true"
      || isGitHubPages || isAtlasPreviewRootScoped)) {
  throw new Error("P3B 3D assets may be staged only for a private, non-static laboratory build.");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false, // La porta d'accesso immersiva non mostra controlli tecnici sovrapposti
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
