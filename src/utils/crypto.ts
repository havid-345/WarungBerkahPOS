/**
 * AES-GCM 256-bit encryption for sensitive POS data:
 * - Customer personal phone/address
 * - Cloud synchronization payloads
 * - Encrypted store backups
 */

const ENCRYPTION_SALT = 'WARUNG_BERKAH_ENCRYPTION_SALT_2026';

/**
 * Derives a CryptoKey from a secret passphrase
 */
export async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(ENCRYPTION_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an arbitrary object or string with AES-GCM
 */
export async function encryptData(data: unknown, passphrase = 'warung-berkah-secret-key-pos'): Promise<string> {
  const enc = new TextEncoder();
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const key = await deriveKey(passphrase);
  
  // 12-byte initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(jsonStr)
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  // Return base64 string
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Decrypts an AES-GCM base64 encoded string
 */
export async function decryptData<T = unknown>(base64Ciphertext: string, passphrase = 'warung-berkah-secret-key-pos'): Promise<T> {
  const binary = atob(base64Ciphertext);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const iv = bytes.slice(0, 12);
  const encryptedBytes = bytes.slice(12);

  const key = await deriveKey(passphrase);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );

  const dec = new TextDecoder();
  const decodedStr = dec.decode(decryptedBuffer);

  try {
    return JSON.parse(decodedStr) as T;
  } catch {
    return decodedStr as unknown as T;
  }
}
