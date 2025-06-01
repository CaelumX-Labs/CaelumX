import { randomBytes } from 'crypto';
import { PublicKey, Connection } from '@solana/web3.js';
import redis from '../config/redis';
import env from '../config/env';
import nacl from "tweetnacl";
const connection = new Connection(env.SOLANA_RPC_URL, 'confirmed');

export async function generateChallenge(wallet: string): Promise<string> {
  const nonce = randomBytes(32).toString('hex');
  if (redis) {
    await redis.set(`nonce:${wallet}`, nonce, {
  EX: 300 // 300 seconds = 5 minutes
});// 5-minute TTL
  }
  return nonce;
}

export async function verifySignature(wallet: string, signature: string, nonce: string): Promise<boolean> {
  if (!redis) return false;
  const storedNonce = await redis.get(`nonce:${wallet}`);
  if (!storedNonce || storedNonce !== nonce) return false;

  await redis.del(`nonce:${wallet}`);

  try {
    const publicKey = new PublicKey(wallet);
    const message = new TextEncoder().encode(nonce);
    const signatureBuffer = Buffer.from(signature, 'hex');

    const isValid = nacl.sign.detached.verify(
      message,
      signatureBuffer,
      publicKey.toBytes()
    );

    return isValid;
  } catch (err) {
    console.error('Verification error:', err);
    return false;
  }
}
// export const generateChallenge = async (wallet: string) => {
//   return `Sign this message to authenticate: ${wallet}`;
// };