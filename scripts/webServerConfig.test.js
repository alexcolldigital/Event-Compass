const { getServerConfig } = require('./webServerConfig');

describe('web server config', () => {
  it('uses an externally reachable host on Render', () => {
    const config = getServerConfig({
      env: { RENDER: 'true', PORT: '10000' },
      projectRoot: '/app/frontend',
    });

    expect(config.host).toBe('0.0.0.0');
    expect(config.port).toBe(10000);
  });
});
