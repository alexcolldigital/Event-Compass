#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getServerConfig } = require('./webServerConfig');

const config = getServerConfig();
const projectRoot = config.projectRoot;
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
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
      ...options,
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });

    child.on('error', reject);
  });
}

(async () => {
  try {
    console.log('Building Expo web bundle for Render...');
    await run('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist']);

    const indexHtml = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexHtml)) {
      throw new Error('Expo web export did not produce dist/index.html');
    }

    console.log('Starting static web server for Render...');
    await run(process.execPath, ['scripts/serve-static.js'], { env: { ...process.env, PORT: String(config.port), WEB_PORT: String(config.port) } });
  } catch (error) {
    console.error('Failed to start Render web server:', error);
    process.exit(1);
  }
})();
