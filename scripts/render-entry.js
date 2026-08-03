#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const { getServerConfig } = require('./webServerConfig');

const config = getServerConfig();
const projectRoot = config.projectRoot;
const child = spawn(process.execPath, ['scripts/start-web.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(config.port),
    WEB_PORT: String(config.port),
    CI: '1',
    EXPO_HOST: config.host,
    RENDER: process.env.RENDER || process.env.RENDER_SERVICE_NAME ? 'true' : 'false',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error('Failed to start Render web server:', error);
  process.exit(1);
});
