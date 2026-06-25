/* eslint-env node */
const { configure } = require('quasar/wrappers');

module.exports = configure(function () {
  return {
    boot: [],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
      'material-symbols-outlined',
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20',
      },

      vueRouterMode: 'hash',
      publicPath: '/boi-estrela-calendarV2/',

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            vueTsc: { tsconfigPath: 'tsconfig.vue-tsc.json' },
            eslint: { lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"' },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {
        brand: {
          primary: '#e1ac26',
          secondary: '#2a2a2a',
          accent: '#e1ac26',
          dark: '#111111',
          'dark-page': '#0d0d0d',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037',
        },
      },
      plugins: ['Notify', 'Loading', 'Dialog'],
    },

    animations: [],

    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render'],
    },

    pwa: {
      workboxMode: 'generateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      extendManifestJson(manifest) {
        Object.assign(manifest, {
          name: 'Boi Estrela',
          short_name: 'Boi Estrela',
          description: 'Calendário de apresentações do Boi Estrela',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#111111',
          theme_color: '#e1ac26',
          start_url: '/boi-estrela-calendarV2/',
          scope: '/boi-estrela-calendarV2/',
          icons: [
            { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
            { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        })
      },
    },
  };
});
