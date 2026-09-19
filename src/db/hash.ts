import md5 from 'md5';

// Intentionally weak: MD5 password hashing (no salt, no bcrypt)
export function hashPassword(password: string): string {
  return md5(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return md5(password) === hash;
}
