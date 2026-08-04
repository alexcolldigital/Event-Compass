const path = require('path');

function getServerConfig(options = {}) {
  const env = options.env || process.env;
  const port = Number(env.PORT || env.WEB_PORT || 3000);
  const isRender = Boolean(env.RENDER || env.RENDER_SERVICE_NAME);
  const host = isRender ? '0.0.0.0' : 'localhost';

  return {
    host,
    port,
    projectRoot: options.projectRoot || path.resolve(__dirname, '..'),
  };
}

module.exports = { getServerConfig };
