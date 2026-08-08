/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude playwright and native modules from webpack bundling
      config.externals = [
        ...config.externals,
        'playwright-core',
        'fsevents',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
