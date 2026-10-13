/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem caching to prevent ArrayBuffer allocation errors on low-memory/paging systems
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
