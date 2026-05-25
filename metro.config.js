const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize bundle size
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: false,
    mangle: { keep_fnames: false },
    output: { comments: false },
    compress: {
      drop_console: true,
      passes: 2,
    },
  },
};

// Reduce resolver fields for faster bundling
config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
};

module.exports = config;
