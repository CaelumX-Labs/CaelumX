import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const authenticate1 = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { wallet: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.wallet) {
    req.user = { wallet: req.session.wallet };
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}
