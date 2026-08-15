const { COUNTRY_PHONE_OPTIONS, DEFAULT_COUNTRY } = require('./countryPhoneOptions');

describe('country phone options', () => {
  it('contains a complete list of dial codes and includes Nigeria by default', () => {
    expect(COUNTRY_PHONE_OPTIONS.length).toBeGreaterThan(180);
    expect(DEFAULT_COUNTRY.name).toBe('Nigeria');
    expect(DEFAULT_COUNTRY.dialCode).toBe('+234');
    expect(COUNTRY_PHONE_OPTIONS.some((country) => country.name === 'Nigeria' && country.dialCode === '+234')).toBe(true);
  });
});
