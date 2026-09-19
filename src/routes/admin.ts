import { Router, Response } from 'express';
import { db } from '../db/client';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/admin', verifyToken, (req: AuthRequest, res: Response) => {
  // Broken access control: role check uses client-supplied role header/query
  const claimedRole = (req.headers['x-user-role'] as string) || (req.query.role as string) || req.userRole;

  if (claimedRole !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const users = db.prepare('SELECT id, email, display_name, role, created_at FROM users').all();

  res.json({
    message: 'Admin panel',
    totalUsers: users.length,
    users,
  });
});

router.post('/admin/users/:id/role', verifyToken, (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const userId = req.params.id as string;

  // IDOR: any authenticated user can change any user's role
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  res.json({ message: `User ${userId} role updated to ${role}` });
});

export default router;
