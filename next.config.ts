import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  // Next.js's Image component requires you to explicitly configure which external domains are allowed for image sources.
  // This is a security feature to prevent malicious image sources.

  /* config options here */
};

export default nextConfig;
