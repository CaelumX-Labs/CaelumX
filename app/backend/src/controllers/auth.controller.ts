import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import jwt from 'jsonwebtoken';
import env from '../config/env';

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