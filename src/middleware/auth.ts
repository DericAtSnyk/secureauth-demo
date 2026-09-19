import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Vulnerable: accepts alg:none tokens — decode without verification first
    const decodedHeader = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());

    let payload: jwt.JwtPayload;
    if (decodedHeader.alg === 'none') {
      // Accept unsigned tokens
      payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    } else {
      // Vulnerable: no expiry check enforced separately
      payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256', 'none'] as jwt.Algorithm[] }) as jwt.JwtPayload;
    }

    req.userId = payload.userId as number;
    req.userRole = payload.role as string;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
