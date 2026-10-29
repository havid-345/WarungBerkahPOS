import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptData, decryptData } from './crypto';

test('encryptData and decryptData perform roundtrip encryption correctly', async () => {
  const secretPayload = {
    customerName: 'Bu Eni',
    phone: '08123456789',
    totalBalance: 12500000,
    timestamp: '2026-10-28T20:00:00Z',
  };

  const encrypted = await encryptData(secretPayload, 'test-secret-key-123');
  assert.ok(typeof encrypted === 'string' && encrypted.length > 20);
  assert.notEqual(encrypted, JSON.stringify(secretPayload));

  const decrypted = await decryptData<typeof secretPayload>(encrypted, 'test-secret-key-123');
  assert.deepEqual(decrypted, secretPayload);
});
