import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Database and AWS SDK code is server-only. If a client compilation
      // still sees those imports, do not polyfill Node built-ins.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
        "drizzle-orm": false,
        postgres: false,
      };
    }
    return config;
  },
};

export default nextConfig;

// `next dev` only. `next build` sets NODE_ENV=production; starting wrangler there
// warns that DOQueueHandler is missing, because that class is exported by the
// OpenNext worker, not by the Next.js build.
if (process.env.NODE_ENV !== "production") {
  initOpenNextCloudflareForDev({ remoteBindings: false }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`OpenNext Cloudflare dev bindings were not initialized: ${message}`);
  });
}
