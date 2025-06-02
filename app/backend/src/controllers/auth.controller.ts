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

// POST /api/auth/get-challenge
export async function getChallenge(req: Request, res: Response) {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet address is required.' });

  try {
    const nonce = await authService.generateChallenge(wallet);
    return res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/auth/verify
export async function verifySignature(req: Request, res: Response) {
  const { wallet, signature, nonce } = req.body;

  if (!wallet || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing wallet, signature, or nonce.' });
  }

  try {
    const isValid = await authService.verifySignature(wallet, signature, nonce);
    if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

    req.session.wallet = wallet;
    const token = jwt.sign({ wallet }, env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// OPTIONAL: POST /api/auth/challenge (session-only login)
export const challenge = async (req: Request, res: Response) => {
  const { wallet, signature, nonce } = req.body;

  if (!wallet || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing wallet, signature, or nonce.' });
  }

  try {
    const isValid = await authService.verifySignature(wallet, signature, nonce);
    if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

    req.session.wallet = wallet;
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in challenge login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
