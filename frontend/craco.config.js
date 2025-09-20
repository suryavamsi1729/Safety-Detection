// // Load configuration from environment or config file
// const path = require('path');

// // Environment variable overrides
// const config = {
//   disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
// };

// module.exports = {
//   webpack: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'),
//     },
//     configure: (webpackConfig) => {
      
//       // Disable hot reload completely if environment variable is set
//       if (config.disableHotReload) {
//         // Remove hot reload related plugins
//         webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
//           return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
//         });
        
//         // Disable watch mode
//         webpackConfig.watch = false;
//         webpackConfig.watchOptions = {
//           ignored: /.*/, // Ignore all files
//         };
//       } else {
//         // Add ignored patterns to reduce watched directories
//         webpackConfig.watchOptions = {
//           ...webpackConfig.watchOptions,
//           ignored: [
//             '**/node_modules/**',
//             '**/.git/**',
//             '**/build/**',
//             '**/dist/**',
//             '**/coverage/**',
//             '**/public/**',
//           ],
//         };
//       }
      
//       return webpackConfig;
//     },
//   },
// };

// Load configuration from environment or config file


const path = require('path');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {

      webpackConfig.module.rules.push({
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: [/node_modules\/@mediapipe\/tasks-vision/],
      });


      // ✅ Exclude mediapipe from source-map-loader warnings
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use) {
          rule.use = rule.use.map((useEntry) => {
            if (
              typeof useEntry === 'object' &&
              useEntry.loader &&
              useEntry.loader.includes('source-map-loader')
            ) {
              useEntry.options = {
                ...useEntry.options,
                filterSourceMappingUrl: (url, resourcePath) => {
                  // Ignore missing maps from @mediapipe/tasks-vision
                  if (resourcePath.includes('@mediapipe/tasks-vision')) {
                    return false;
                  }
                  return true;
                },
              };
            }
            return useEntry;
          });
        }
      });
      // 🔥 Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor.name !== 'HotModuleReplacementPlugin'
        );
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Limit watch dirs for performance
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }

      return webpackConfig;
    },
  },
};
