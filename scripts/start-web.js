const path = require('path');

const { DevServerManager } = require('@expo/cli/build/src/start/server/DevServerManager');
const { WebSupportProjectPrerequisite } = require('@expo/cli/build/src/start/doctor/web/WebSupportProjectPrerequisite');
const { setNodeEnv } = require('@expo/cli/build/src/utils/nodeEnv');

const projectRoot = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || process.env.WEB_PORT || 3000);

async function main() {
  setNodeEnv('development');
  require('@expo/env').load(projectRoot);

  const options = {
    mode: 'development',
    devClient: false,
    forceManifestType: undefined,
    privateKeyPath: undefined,
    https: false,
    maxWorkers: undefined,
    resetDevServer: false,
    minify: false,
    port,
    location: {
      hostType: 'localhost',
      scheme: null,
    },
  };

  const devServerManager = new DevServerManager(projectRoot, options);
  await devServerManager.ensureProjectPrerequisiteAsync(WebSupportProjectPrerequisite);
  await devServerManager.startAsync([{ type: 'webpack', options }]);

  console.log(`Web frontend running at http://localhost:${port}`);
  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
