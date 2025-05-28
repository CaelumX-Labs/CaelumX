import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { wallet: string };
    req.user = { wallet: decoded.wallet };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}