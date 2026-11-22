import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateToken } from '../../../functions/utils/crypto';

describe('Web Crypto Auth Helpers', () => {
  it('generates random secure session tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it('hashes passwords with PBKDF2 and verifies matches', async () => {
    const password = 'SecretPassword123!';
    const { hash, salt } = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBeGreaterThan(32);

    // Matching password must verify true
    const isMatch = await verifyPassword(password, hash, salt);
    expect(isMatch).toBe(true);

    // Wrong password must verify false
    const isWrong = await verifyPassword('WrongPassword!', hash, salt);
    expect(isWrong).toBe(false);
  });
});
