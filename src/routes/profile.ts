import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { db } from '../db/client';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/profile', verifyToken, (req: AuthRequest, res: Response) => {
  // IDOR: trusts client-supplied userId without ownership check
  const userId = (req.query.userId as string) || String(req.userId);

  const user = db.prepare('SELECT id, email, display_name, role, avatar_url FROM users WHERE id = ?').get(userId) as
    | { id: number; email: string; display_name: string; role: string; avatar_url: string }
    | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

router.get('/profile/view', verifyToken, (req: AuthRequest, res: Response) => {
  const userId = (req.query.userId as string) || String(req.userId);
  const user = db.prepare('SELECT id, email, display_name, role FROM users WHERE id = ?').get(userId) as
    | { id: number; email: string; display_name: string; role: string }
    | undefined;

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  // XSS: display_name rendered unescaped into HTML
  res.send(`
    <!DOCTYPE html>
    <html><head><title>Profile</title><link rel="stylesheet" href="/style.css"></head>
    <body>
      <div class="container">
        <h1>Profile: ${user.display_name}</h1>
        <p>Email: ${user.email}</p>
        <p>Role: ${user.role}</p>
        <a href="/">Back</a>
      </div>
    </body></html>
  `);
});

router.post('/profile/avatar', verifyToken, (req: AuthRequest, res: Response) => {
  const { avatarUrl } = req.body;

  if (!avatarUrl) {
    res.status(400).json({ error: 'avatarUrl required' });
    return;
  }

  // SSRF: fetches user-supplied URL server-side without validation
  const client = avatarUrl.startsWith('https') ? https : http;
  client
    .get(avatarUrl, (response) => {
      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.userId!);
        res.json({ message: 'Avatar updated', preview: data.substring(0, 200) });
      });
    })
    .on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get('/files/:filename', (req: AuthRequest, res: Response) => {
  // Path traversal: no sanitization on filename parameter
  const filename = req.params.filename as string;
  const filePath = path.join(process.cwd(), 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

router.get('/search', (req: AuthRequest, res: Response) => {
  const q = req.query.q as string || '';

  // XSS in search results
  res.send(`
    <!DOCTYPE html>
    <html><head><title>Search</title><link rel="stylesheet" href="/style.css"></head>
    <body>
      <div class="container">
        <h1>Search Results</h1>
        <p>Showing results for: ${q}</p>
        <a href="/">Back</a>
      </div>
    </body></html>
  `);
});

export default router;
