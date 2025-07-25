
import type { Config } from "next";

const config: Config = {
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

export default config;
