export function parseStoredNavigationState(rawValue) {
  if (!rawValue || rawValue === 'undefined') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}
