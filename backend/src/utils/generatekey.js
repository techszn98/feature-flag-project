const crypto = require('crypto');

// Creates one new key: the raw version (shown to the user ONCE),
function generateKey(prefix = 'fk') {
  const rawKey = `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPreview = `${rawKey.slice(0, 10)}...${rawKey.slice(-4)}`;

  return { rawKey, hashedKey, keyPreview };
}

// Used in checking a key a client sends against the stored hash.
function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

module.exports = { generateKey, hashKey };