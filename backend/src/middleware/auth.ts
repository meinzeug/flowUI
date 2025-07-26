import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export interface AuthRequest extends Request {
  user?: string;
  userId?: number;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
  console.log('Authorization header:', authHeader);
  if (!authHeader) return res.status(401).json({ error: 'missing_auth' });
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ error: 'missing_auth' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload.user;
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}
