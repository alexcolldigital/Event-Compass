#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const child = spawn(process.execPath, ['scripts/start-web.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(process.env.PORT || process.env.WEB_PORT || 3000),
    CI: '1',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error('Failed to start Render web server:', error);
  process.exit(1);
});
