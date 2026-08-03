#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { getServerConfig } = require('./webServerConfig');

const config = getServerConfig();
const projectRoot = config.projectRoot;
const distDir = path.join(projectRoot, 'dist');
const indexHtml = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('dist/index.html not found. Run npm run predeploy first.');
  process.exit(1);
}

console.log('Starting static web server for Render...');
require('./serve-static.js');
