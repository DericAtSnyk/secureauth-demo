import { exec } from 'child_process';
import { Request, Response, Router } from 'express';

const router = Router();

// Intentionally vulnerable endpoint used to verify Snyk Code PR scanning.
router.get('/snyk-test/lookup', (req: Request, res: Response) => {
  const host = (req.query.host as string) || 'localhost';

  exec(`nslookup ${host}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr || error.message });
      return;
    }

    res.type('text/plain').send(stdout);
  });
});

export default router;
