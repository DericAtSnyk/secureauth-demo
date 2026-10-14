import { Router, Response, raw } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

const MAX_SIZE = 5 * 1024 * 1024;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Extension is derived from the file's magic bytes, never from client input
const SIGNATURES: { ext: string; test: (b: Buffer) => boolean }[] = [
  { ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'jpg', test: (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
  { ext: 'gif', test: (b) => ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1')) },
  {
    ext: 'webp',
    test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  },
];

// POST /upload with the raw image bytes as the body and an image/* Content-Type
router.post(
  '/upload',
  uploadLimiter,
  verifyToken,
  raw({ type: 'image/*', limit: MAX_SIZE }),
  (req: AuthRequest, res: Response) => {
    const body = req.body as Buffer;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(400).json({ error: 'Send an image as the request body with an image/* Content-Type' });
      return;
    }

    const match = SIGNATURES.find((s) => s.test(body));
    if (!match) {
      res.status(415).json({ error: 'Unsupported file type. Allowed: png, jpg, gif, webp' });
      return;
    }

    const filename = `${uuidv4()}.${match.ext}`;
    const target = path.resolve(UPLOADS_DIR, filename);
    if (path.dirname(target) !== UPLOADS_DIR) {
      res.status(400).json({ error: 'Invalid file name' });
      return;
    }
    // 'wx' fails instead of overwriting an existing file
    fs.writeFileSync(target, body, { flag: 'wx' });

    res.status(201).json({ filename, size: body.length });
  }
);

export default router;
