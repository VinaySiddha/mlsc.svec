/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '192.168.1.30',
    '10.5.0.2',
    'localhost',
    '127.0.0.1',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'nodemailer',
    'genkit',
    '@genkit-ai/core',
    '@genkit-ai/googleai',
    'handlebars',
    'require-in-the-middle',
    '@opentelemetry/sdk-node',
    '@opentelemetry/instrumentation',
  ],
  transpilePackages: ['framer-motion'],
  images: {
    localPatterns: [
      {
        pathname: '/api/image',
        search: '?url=*',
      },
      {
        pathname: '/**',
      }
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gratisography.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sves.org.in",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "1drv.ms",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ibb.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ui-avatars.com",
        port: "",
        pathname: "/**",
      },
      
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  trailingSlash: true,
};

export default nextConfig;
