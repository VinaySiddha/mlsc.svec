
/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gratisography.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sves.org.in',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = config;
