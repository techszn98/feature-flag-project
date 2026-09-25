const isPlainObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);

// Recursively drops MongoDB operator keys ($, .) and strips angle brackets from strings.
// Used on req.body and on the query string as it's parsed.
const cleanValue = (value) => {
  if (typeof value === 'string') {
    return value.replace(/[<>]/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }
  if (isPlainObject(value)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue; // e.g. "$where", "a.b"
      cleaned[key] = cleanValue(value[key]);
    }
    return cleaned;
  }
  return value;
};

// If a query key was repeated (?a=1&a=2), keep only the last value.
// This is what the "hpp" package used to do.
const dedupeArrays = (value) => {
  if (isPlainObject(value)) {
    const result = {};
    for (const key of Object.keys(value)) {
      const v = value[key];
      result[key] = Array.isArray(v) ? dedupeArrays(v[v.length - 1]) : dedupeArrays(v);
    }
    return result;
  }
  return value;
};

module.exports = { cleanValue, dedupeArrays };