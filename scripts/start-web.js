const path = require('path');
const { spawn } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || process.env.WEB_PORT || 3000);
const isWindows = process.platform === 'win32';

const expoCommand = path.join(projectRoot, 'node_modules', '.bin', isWindows ? 'expo.cmd' : 'expo');
const args = ['start', '--web', '--host', '0.0.0.0', '--port', String(port)];

console.log(`Starting Expo web server on port ${port}`);
console.log(`Running command: ${expoCommand} ${args.join(' ')}`);

const child = spawn(isWindows ? 'cmd.exe' : expoCommand, isWindows ? ['/c', expoCommand, ...args] : args, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
    CI: '1',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error('Failed to start Expo web server:', error);
  process.exit(1);
});
