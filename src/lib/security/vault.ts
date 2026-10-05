/**
 * Local Vault Security Module
 * Uses browser Web Crypto APIs (SubtleCrypto) for zero-knowledge local client encryption.
 * Encrypts beneficiary databases before writing to browser storage when vault mode is enabled.
 */

const SALT_BYTES = 16;
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 100000;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText: string, passcode: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return plainText;
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passcode, salt);

  const enc = new TextEncoder();
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );

  const payload = {
    v: 1,
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    data: bufferToBase64(cipherBuffer),
  };

  return JSON.stringify(payload);
}

export async function decryptData(cipherJson: string, passcode: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return cipherJson;
  }
  try {
    const payload = JSON.parse(cipherJson);
    if (!payload.salt || !payload.iv || !payload.data) {
      // Plain text fallback
      return cipherJson;
    }
    const salt = new Uint8Array(base64ToBuffer(payload.salt));
    const iv = new Uint8Array(base64ToBuffer(payload.iv));
    const cipherBuffer = base64ToBuffer(payload.data);

    const key = await deriveKey(passcode, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Invalid passcode or corrupted encrypted data');
  }
}

export async function hashPasscode(passcode: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return passcode;
  }
  const enc = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(passcode));
  return bufferToBase64(hashBuffer);
}
