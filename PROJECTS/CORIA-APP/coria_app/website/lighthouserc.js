module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/tr',
        'http://localhost:3000/en',
        'http://localhost:3000/de',
        'http://localhost:3000/fr',
        'http://localhost:3000/tr/features',
        'http://localhost:3000/tr/pricing',
        'http://localhost:3000/tr/about',
        'http://localhost:3000/tr/contact',
        'http://localhost:3000/tr/blog'
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1.0 }],
        'categories:pwa': ['warn', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {},
    wizard: {}
  }
};