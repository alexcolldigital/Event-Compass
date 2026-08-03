#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getServerConfig } = require('./webServerConfig');

const config = getServerConfig();
const projectRoot = config.projectRoot;
const distDir = path.join(projectRoot, 'dist');
const indexHtml = path.join(distDir, 'index.html');

function ensureBuild() {
  if (fs.existsSync(indexHtml)) {
    return true;
  }

  console.log('dist/index.html not found. Building web bundle...');
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['run', 'predeploy'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  return fs.existsSync(indexHtml);
}

if (!ensureBuild()) {
  console.error('Unable to create dist/index.html.');
  process.exit(1);
}

console.log('Starting static web server for Render...');
require('./serve-static.js');
