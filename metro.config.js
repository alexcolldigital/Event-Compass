const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure all file extensions are properly resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx'];

// Keep the frontend dev server on a single expected port.
config.server = {
  ...config.server,
  port: 3000,
};

module.exports = config;

