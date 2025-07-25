/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["placehold.co", "lh3.googleusercontent.com", "gratisography.com"],
  },
};

module.exports = config;
