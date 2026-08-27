const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias = {
    ...config.resolve.alias,
    'node:async_hooks': false,
    'node:buffer': require.resolve('buffer/'),
    'node:stream': require.resolve('stream-browserify'),
    'node:util': require.resolve('util/'),
    'node:path': require.resolve('path-browserify'),
    'node:crypto': require.resolve('crypto-browserify'),
    'node:os': require.resolve('os-browserify/browser'),
    'node:http': require.resolve('stream-http'),
    'node:https': require.resolve('https-browserify'),
    'node:url': require.resolve('url/'),
    'node:zlib': require.resolve('browserify-zlib'),
    'node:assert': require.resolve('assert/'),
    'node:events': require.resolve('events/'),
    'node:process': require.resolve('process/browser'),
  };

  return config;
};
