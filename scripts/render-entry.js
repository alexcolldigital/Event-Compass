#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getServerConfig } = require('./webServerConfig');

const config = getServerConfig();
const projectRoot = config.projectRoot;
const distDir = path.join(projectRoot, 'dist');
const indexHtml = path.join(distDir, 'index.html');

function ensureDistBundle() {
  if (fs.existsSync(indexHtml)) {
    return true;
  }

  console.log('dist/index.html not found. Generating web bundle...');
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['run', 'predeploy'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
    shell: true,
  });

  if (result.status !== 0) {
    console.error('Failed to generate dist assets for Render.');
    process.exit(result.status || 1);
  }

  return fs.existsSync(indexHtml);
}

if (!ensureDistBundle()) {
  console.error('dist/index.html could not be generated.');
  process.exit(1);
}

console.log('Starting static web server for Render...');
require('./serve-static.js');
