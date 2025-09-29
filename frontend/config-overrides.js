// frontend/config-overrides.js
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = function override(config, env) {
  // Ensure plugins array exists, then add Workbox GenerateSW
  config.plugins = config.plugins || [];
  config.plugins.push(
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: ({url}) => url.pathname.startsWith('/api/'),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }
          }
        },
        {
          urlPattern: ({request}) => ['style', 'script', 'worker'].includes(request.destination),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'static-resources' }
        },
        {
          urlPattern: ({request}) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }
          }
        }
      ]
    })
  );
  return config;
};
