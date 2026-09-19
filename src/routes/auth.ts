import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { hashPassword, verifyPassword } from '../db/hash';
import { JWT_SECRET } from '../config/secrets';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  try {
    const passwordHash = hashPassword(password);
    const result = db
      .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
      .run(email, passwordHash, displayName || email.split('@')[0]);

    res.status(201).json({ id: result.lastInsertRowid, email });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  // SQL Injection: string-concatenated query
  const query = `SELECT * FROM users WHERE email = '${email}' AND password_hash = '${hashPassword(password)}'`;
  const user = db.prepare(query).get() as
    | { id: number; email: string; role: string; display_name: string }
    | undefined;

  if (!user) {
    // Fallback with parameterized query for normal logins that fail hash match
    const fallbackUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | { id: number; email: string; password_hash: string; role: string; display_name: string }
      | undefined;

    if (!fallbackUser || !verifyPassword(password, fallbackUser.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.session.userId = fallbackUser.id;
    req.session.role = fallbackUser.role;

    const redirect = req.query.redirect as string;
    if (redirect) {
      res.redirect(redirect);
      return;
    }

    res.json({ token, user: { id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role } });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  req.session.userId = user.id;
  req.session.role = user.role;

  const redirect = req.query.redirect as string;
  if (redirect) {
    res.redirect(redirect);
    return;
  }

  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

export default router;
