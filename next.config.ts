import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": ["./_archive/**/*"],
  },
  // Kamino's klend-sdk transitively pulls WASM bindings from Orca
  // (@orca-so/whirlpools-core) that Turbopack can't inline into an
  // API-route bundle. Marking these as external keeps them as runtime
  // Node resolutions instead of build-time bundling.
  serverExternalPackages: [
    "@kamino-finance/klend-sdk",
    "@orca-so/whirlpools-core",
    "@orca-so/whirlpools-client",
  ],
};

export default nextConfig;
