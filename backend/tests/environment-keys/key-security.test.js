const { test } = require('node:test');
const assert = require('node:assert/strict');

const { generateKey, hashKey } = require('../../src/utils/generateKey');

test('generateKey returns a rawKey, hashedKey, and keyPreview', () => {
  const { rawKey, hashedKey, keyPreview } = generateKey();

  assert.ok(rawKey, 'rawKey should exist');
  assert.ok(hashedKey, 'hashedKey should exist');
  assert.ok(keyPreview, 'keyPreview should exist');
});

test('rawKey and hashedKey are never the same value', () => {
  const { rawKey, hashedKey } = generateKey();

  //what's stored NOT equal the real key.
  assert.notEqual(rawKey, hashedKey);
});

test('hashedKey is a sha256 hex string (64 characters)', () => {
  const { hashedKey } = generateKey();

  assert.equal(hashedKey.length, 64);
  assert.match(hashedKey, /^[a-f0-9]+$/);
});

test('two calls to generateKey never produce the same rawKey', () => {
  const first = generateKey();
  const second = generateKey();

  // Proves randomness — if these ever matched, keys would be guessable.
  assert.notEqual(first.rawKey, second.rawKey);
  assert.notEqual(first.hashedKey, second.hashedKey);
});

test('keyPreview does not expose the full rawKey', () => {
  const { rawKey, keyPreview } = generateKey();

  assert.ok(keyPreview.length < rawKey.length);
});

test('hashKey produces the same hash as generateKey did for the same rawKey', () => {
  const { rawKey, hashedKey } = generateKey();

  // re-hash whatever the client sends, and compare it to what's stored.
  const recomputedHash = hashKey(rawKey);

  assert.equal(recomputedHash, hashedKey);
});

test('hashKey gives a different result for a different input', () => {
  const hashA = hashKey('some-fake-key-123');
  const hashB = hashKey('a-completely-different-key');

  assert.notEqual(hashA, hashB);
});

test('generateKey respects a custom prefix', () => {
  const { rawKey } = generateKey('test');

  assert.ok(rawKey.startsWith('test_'));
});