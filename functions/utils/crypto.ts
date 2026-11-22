/**
 * Web Crypto password hashing & token generation utility
 * Works universally in Cloudflare Workers isolates and Node/Vitest.
 */

function getCrypto(): Crypto {
  if (typeof crypto !== 'undefined') return crypto;
  // Node fallback if needed
  // @ts-ignore
  return (globalThis as any).crypto;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  getCrypto().getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  getCrypto().getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

export async function hashPassword(
  password: string,
  providedSalt?: string
): Promise<{ hash: string; salt: string }> {
  const c = getCrypto();
  const saltHex = providedSalt || generateSalt();
  const saltBuffer = hexToBuffer(saltHex);

  const enc = new TextEncoder();
  const passwordKey = await c.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await c.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return {
    hash: bufferToHex(derivedBits),
    salt: saltHex,
  };
}

export async function verifyPassword(
  password: string,
  expectedHash: string,
  salt: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  // Constant time comparison
  if (hash.length !== expectedHash.length) return false;
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return result === 0;
}
