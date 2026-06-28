import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const tokenBlacklist = new Set<string>();

export interface JwtPayload {
  userId: string;
  activeRole?: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const blacklistToken = (token: string) => tokenBlacklist.add(token);

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been invalidated' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.activeRole !== role) {
    return res.status(403).json({ error: `This action requires ${role} role. Your active role is ${req.user.activeRole || 'none'}.` });
  }
  next();
};

export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};
