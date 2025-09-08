/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['postgres', 'drizzle-orm'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js modules on the client side
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
        'drizzle-orm': false,
        postgres: false,
      };
    }
    return config;
  },
  // Ensure database code only runs on server
  serverExternalPackages: ['postgres', 'drizzle-orm'],
};

module.exports = nextConfig;