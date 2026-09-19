import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { hashPassword } from '../db/hash';

const router = Router();

router.post('/password-reset/request', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;

  if (user) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(
      user.id,
      token,
      expiresAt
    );
    // In a real app we'd email this; for demo we return it
    res.json({ message: 'Reset token generated', token });
  } else {
    res.json({ message: 'If that email exists, a reset link was sent' });
  }
});

router.post('/password-reset/confirm', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: 'Token and new password required' });
    return;
  }

  const resetToken = db
    .prepare('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0')
    .get(token) as { user_id: number; expires_at: string } | undefined;

  if (!resetToken) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  const passwordHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, resetToken.user_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);

  res.json({ message: 'Password updated successfully' });
});

// CSRF: state-changing password change with no anti-CSRF token
router.post('/password-change', (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
    | { id: number; password_hash: string }
    | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (hashPassword(currentPassword) !== user.password_hash) {
    res.status(401).json({ error: 'Current password incorrect' });
    return;
  }

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), userId);
  res.json({ message: 'Password changed' });
});

export default router;
