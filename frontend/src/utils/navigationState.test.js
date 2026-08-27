const { parseStoredNavigationState } = require('./navigationState');

describe('parseStoredNavigationState', () => {
  it('returns undefined for empty or placeholder values', () => {
    expect(parseStoredNavigationState(null)).toBeUndefined();
    expect(parseStoredNavigationState('undefined')).toBeUndefined();
    expect(parseStoredNavigationState('')).toBeUndefined();
  });

  it('parses valid navigation state objects and ignores malformed JSON', () => {
    expect(parseStoredNavigationState('{"routes":[{"name":"Home"}]}')).toMatchObject({
      routes: [{ name: 'Home' }],
    });
    expect(parseStoredNavigationState('{not valid json}')).toBeUndefined();
  });
});
