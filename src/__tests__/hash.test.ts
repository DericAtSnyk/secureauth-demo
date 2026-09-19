import { hashPassword, verifyPassword } from '../db/hash';

describe('password hashing', () => {
  it('hashes a password deterministically', () => {
    const hash = hashPassword('testpassword');
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(32);
  });

  it('verifies a correct password', () => {
    const password = 'admin123';
    const hash = hashPassword(password);
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it('rejects an incorrect password', () => {
    const hash = hashPassword('correct');
    expect(verifyPassword('wrong', hash)).toBe(false);
  });
});
