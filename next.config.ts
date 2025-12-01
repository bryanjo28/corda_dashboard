import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores sibling lockfiles picked up in the parent directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
