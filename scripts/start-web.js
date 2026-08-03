const path = require('path');
const { spawn } = require('child_process');
const { getServerConfig } = require('./webServerConfig');

const config = getServerConfig();
const projectRoot = config.projectRoot;
const port = config.port;
const host = config.host;
const isWindows = process.platform === 'win32';

console.log(`Starting Expo web server on ${host}:${port}`);

const env = {
  ...process.env,
  PORT: String(port),
  WEB_PORT: String(port),
  CI: '1',
  EXPO_HOST: host,
  RENDER: process.env.RENDER || process.env.RENDER_SERVICE_NAME ? 'true' : 'false',
};

const args = ['expo', 'start', '--web', '--port', String(port), '--non-interactive'];
const child = isWindows
  ? spawn('cmd.exe', ['/c', 'npx.cmd', ...args], {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
    })
  : spawn('npx', args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env,
    });

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
