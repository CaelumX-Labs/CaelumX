import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import jwt from 'jsonwebtoken';
import env from '../config/env';

// Extend express-session types to include 'wallet'
declare module 'express-session' {
  interface SessionData {
    wallet?: string;
  }
}

export async function getChallenge(req: Request, res: Response) {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet required' });
  const nonce = await authService.generateChallenge(wallet);
  res.json({ nonce });
}

export async function verifySignature(req: Request, res: Response) {
  const { wallet, signature, nonce } = req.body;
  if (!wallet || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const isValid = await authService.verifySignature(wallet, signature, nonce);
  if (isValid) {
    const token = jwt.sign({ wallet }, env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid signature' });
  }
}

export const challenge = async (req: Request, res: Response) => {
  const { wallet, signature, nonce } = req.body;

  if (!wallet || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing wallet, signature, or nonce' });
  }

  const isValid = await authService.verifySignature(wallet, signature, nonce); // ✅ await the async function

  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

  req.session.wallet = wallet; // 💾 Save wallet to session
  res.json({ success: true });
};
