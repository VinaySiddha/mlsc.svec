/** @type {import('next').NextConfig} */
const nextConfig = {
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
        pathname: '/logo.png',
      },
      {
        pathname: '/team1.jpg',
      },
      {
        pathname: '/g2.jpg',
      },
      {
        pathname: '/flask.png',
      },
      {
        pathname: '/blueday.png',
      },
      {
        pathname: '/web.jpg',
      },
      {
        pathname: '/azure.jpg',
      },
      {
        pathname: '/images/event-placeholder.png',
      },
      {
        pathname: '/',
      },
      {
        pathname: '/blog1.jpg',
      },
      {
        pathname: '/moment_screenshot.png',
      },
      {
        pathname: '/g1.jpg',
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
  trailingSlash: true,
};

export default nextConfig;
