/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mlscsvec.com',
  generateRobotsTxt: false, // Managed in public/robots.txt
  sitemapSize: 7000,
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
  ],
  exclude: [
    // Internal administration and management
    '/admin',
    '/admin/*',
    '/api/*',
    '/auth/*',
    '/login',
    '/profile',
    '/profile/*',
    '/onboard',
    '/onboard/*',
    '/track',
    '/track/*',
    '/mlsc-pay',
    '/mlsc-pay/*',
    '/issue-tracker',
    '/issue-tracker/*',
    '/status',
    '/status/*',
    '/quiz',
    '/quiz/*',
    '/donate',
    '/donate/*',
    '/services',
    '/services/*',
    '/community/new',
    '/community/*/edit',
    '/contribute/dashboard',
    '/contribute/reverify',
    '/id/*',
  ],
  transform: async (config, path) => {
    // 1. Flagship Home Page
    if (path === '/' || path === '') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // 2. Primary High-Value Content Hubs
    if (path === '/blog' || path === '/about' || path === '/domains' || path === '/events' || path === '/team') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // 3. Editorial Articles (22+ In-Depth Technical Posts)
    if (path.startsWith('/blog/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.85,
        lastmod: new Date().toISOString(),
      };
    }

    // 4. Contact & Identity Verification Hub
    if (path === '/contact') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.85,
        lastmod: new Date().toISOString(),
      };
    }

    // 5. Specialized Domain Tracks & Community Showcases
    if (path.startsWith('/domains/') || path === '/projects' || path === '/contributors' || path === '/contribute') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.75,
        lastmod: new Date().toISOString(),
      };
    }

    // 6. Mandatory Compliance & Legal Disclosures
    if (path === '/privacy-policy' || path === '/terms-and-conditions' || path === '/guidelines') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      };
    }

    // Fallback for general pages
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    };
  },
};
