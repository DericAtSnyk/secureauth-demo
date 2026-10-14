import { Request, Response, Router } from 'express';
import { db } from '../db/client';

const router = Router();

// Intentionally vulnerable endpoint used to verify Snyk Code PR scanning.
router.get('/directory/users', (req: Request, res: Response) => {
  const email = (req.query.email as string) || '';
  const query = `SELECT id, email, display_name, role FROM users WHERE email LIKE '%${email}%'`;
  const users = db.prepare(query).all();

  res.json({ users });
});

export default router;
