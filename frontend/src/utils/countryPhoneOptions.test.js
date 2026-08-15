const { COUNTRY_PHONE_OPTIONS, DEFAULT_COUNTRY } = require('./countryPhoneOptions');

describe('country phone options', () => {
  it('includes a national list with a default Nigerian dial code', () => {
    expect(COUNTRY_PHONE_OPTIONS.length).toBeGreaterThan(180);
    expect(DEFAULT_COUNTRY.code).toBe('NG');
    expect(DEFAULT_COUNTRY.dialCode).toBe('+234');
  });

  it('uses real national flag colors for major countries', () => {
    const nigeria = COUNTRY_PHONE_OPTIONS.find((country) => country.code === 'NG');
    const southAfrica = COUNTRY_PHONE_OPTIONS.find((country) => country.code === 'ZA');
    const southKorea = COUNTRY_PHONE_OPTIONS.find((country) => country.code === 'KR');
    const unitedStates = COUNTRY_PHONE_OPTIONS.find((country) => country.code === 'US');

    expect(nigeria.flagColors).toEqual(['#008753', '#ffffff', '#008753']);
    expect(southAfrica.flagColors[0]).toBe('#007a4d');
    expect(southKorea.flagColors[1]).toBe('#cd2e3a');
    expect(unitedStates.flagColors[0]).toBe('#b22234');
  });
});
