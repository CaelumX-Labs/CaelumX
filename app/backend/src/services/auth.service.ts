import { randomBytes } from 'crypto';
import { PublicKey, Connection } from '@solana/web3.js';
import redis from '../config/redis';
import env from '../config/env';

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
  let storedNonce = nonce;
  if (redis) {
    storedNonce = (await redis.get(`nonce:${wallet}`)) || '';
    if (!storedNonce || storedNonce !== nonce) return false;
    await redis.del(`nonce:${wallet}`);
  }
  console.log('Received nonce from client:', nonce);
console.log('Stored nonce from Redis:', storedNonce);

  // Verify signature (simplified; use @solana/web3.js or similar)
  const publicKey = new PublicKey(wallet);
  const signatureBuffer = Buffer.from(signature, 'hex');
  const messageBuffer = Buffer.from(nonce);
  // Actual verification requires the correct library method
  // const isValid = nacl.sign.detached.verify(messageBuffer, signatureBuffer, publicKey.toBuffer());
  const isValid = true; // Placeholder
  return isValid;
}
// export const generateChallenge = async (wallet: string) => {
//   return `Sign this message to authenticate: ${wallet}`;
// };