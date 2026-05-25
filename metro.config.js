const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const IS_PROD = process.env.APP_ENV === 'production';

config.transformer = {
  ...config.transformer,
  ...(IS_PROD && {
    minifierConfig: {
      keep_fnames: false,
      mangle: { keep_fnames: false },
      output: { comments: false },
      compress: {
        drop_console: true,
        passes: 2,
      },
    },
  }),
};

config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
};

module.exports = config;
