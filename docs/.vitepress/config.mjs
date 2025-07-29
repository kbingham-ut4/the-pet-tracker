import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Pet Tracker Documentation',
  description: 'Complete documentation for the Pet Tracker mobile application',
  base: '/the-pet-tracker/',

  // Ensure proper asset handling for GitHub Pages
  assetsDir: 'assets',

  // Enable source maps for better debugging
  vite: {
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },

  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/the-pet-tracker/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Pet Tracker Documentation' }],
    ['meta', { property: 'og:site_name', content: 'Pet Tracker Docs' }],
    ['meta', { property: 'og:image', content: '/the-pet-tracker/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://kbingham-ut4.github.io/the-pet-tracker/' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Testing', link: '/development/testing' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Deployment', link: '/deployment/' },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: 'What is Pet Tracker?', link: '/introduction/what-is-pet-tracker' },
          { text: 'Features', link: '/introduction/features' },
          { text: 'Architecture', link: '/introduction/architecture' },
          { text: 'Tech Stack', link: '/introduction/tech-stack' },
        ],
      },
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Prerequisites', link: '/getting-started/prerequisites' },
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Environment Setup', link: '/getting-started/environment-setup' },
          { text: 'Running the App', link: '/getting-started/running-the-app' },
          { text: 'Project Structure', link: '/getting-started/project-structure' },
        ],
      },
      {
        text: 'Development',
        collapsed: false,
        items: [
          { text: 'Development Workflow', link: '/development/workflow' },
          { text: 'GitHub Actions & CI/CD', link: '/development/github-actions' },
          { text: 'ID Management', link: '/development/id-management' },
          { text: 'Logging System', link: '/development/logging' },
          { text: 'Storage System', link: '/development/storage' },
          { text: 'Code Style', link: '/development/code-style' },
          { text: 'Testing', link: '/development/testing' },
          { text: 'Debugging', link: '/development/debugging' },
          { text: 'Performance', link: '/development/performance' },
        ],
      },
      {
        text: 'Features',
        collapsed: false,
        items: [
          { text: 'Pet Management', link: '/features/pet-management' },
          { text: 'Health Tracking', link: '/features/health-tracking' },
          { text: 'Nutrition & Weight', link: '/features/nutrition-weight' },
          { text: 'Activities', link: '/features/activities' },
          { text: 'Veterinary Records', link: '/features/veterinary-records' },
        ],
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: [
          { text: 'Context API', link: '/api/context' },
          { text: 'Services', link: '/api/services' },
          { text: 'Utils', link: '/api/utils' },
          { text: 'Types', link: '/api/types' },
          { text: 'Configuration', link: '/api/configuration' },
        ],
      },
      {
        text: 'Deployment',
        collapsed: false,
        items: [
          { text: 'Environment Configuration', link: '/deployment/environment-config' },
          { text: 'Building for Production', link: '/deployment/building' },
          { text: 'App Store Deployment', link: '/deployment/app-store' },
          { text: 'Play Store Deployment', link: '/deployment/play-store' },
          { text: 'CI/CD Pipeline', link: '/deployment/ci-cd' },
          { text: 'GitHub Actions', link: '/development/github-actions' },
        ],
      },
      {
        text: 'Configuration',
        collapsed: false,
        items: [
          { text: 'Analytics Setup', link: '/configuration/analytics' },
          { text: 'Error Tracking', link: '/configuration/error-tracking' },
          { text: 'Push Notifications', link: '/configuration/push-notifications' },
          { text: 'Database Setup', link: '/configuration/database' },
        ],
      },
      {
        text: 'Contributing',
        collapsed: false,
        items: [
          { text: 'Contributing Guide', link: '/contributing/guide' },
          { text: 'Code of Conduct', link: '/contributing/code-of-conduct' },
          { text: 'Pull Request Process', link: '/contributing/pull-requests' },
          { text: 'Issue Templates', link: '/contributing/issue-templates' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/kbingham-ut4/the-pet-tracker' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Pet Tracker Team',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/kbingham-ut4/the-pet-tracker/edit/main/docs/:path',
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      },
    },
  },

  markdown: {
    theme: 'material-theme-palenight',
    lineNumbers: true,
  },

  cleanUrls: true,
});
