export default {
  // Cloudflare-specific configuration
  runtime: {
    // Configure runtime for Cloudflare Workers compatibility
    nodejs_compat: true,
  },
  
  // Static file handling
  assets: {
    // Handle static assets properly
    include: ['**/*'],
    exclude: ['node_modules/**/*']
  },

  // Environment variables that will be available at runtime
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }
};
