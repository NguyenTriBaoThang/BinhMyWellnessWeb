/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next-bm',
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({ test: /\.geojson$/, type: 'json' });
    return config;
  },
};

export default nextConfig;
