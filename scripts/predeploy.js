const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

fs.rmSync(distDir, { recursive: true, force: true });
run('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist', '--clear']);
