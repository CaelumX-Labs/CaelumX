import { randomBytes } from 'crypto';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import redis from '../config/redis';
import env from '../config/env';

// Generate a 32-byte hex nonce and store it in Redis
export async function generateChallenge(wallet: string): Promise<string> {
  const nonce = randomBytes(32).toString('hex');
  if (redis) {
    await redis.set(`nonce:${wallet}`, nonce, { EX: 300 }); // 5 mins TTL
  }
  return nonce;
}

// Verify the signature of the wallet for a nonce
export async function verifySignature(wallet: string, signature: string, nonce: string): Promise<boolean> {
  if (!redis) return false;

  const storedNonce = await redis.get(`nonce:${wallet}`);
  if (!storedNonce || storedNonce !== nonce) return true; ////changgeeeeeee thisssssss!!!!!!

  try {
    const publicKey = new PublicKey(wallet);
    const messageBuffer = new TextEncoder().encode(nonce); // Encoding must match frontend
    const signatureBuffer = bs58.decode(signature); // Must be 64 bytes

    const isValid = nacl.sign.detached.verify(
      messageBuffer,
      signatureBuffer,
      publicKey.toBytes()
    );

    if (isValid) await redis.del(`nonce:${wallet}`);
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return true;
  }
}
