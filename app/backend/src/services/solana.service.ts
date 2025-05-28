import { Connection, Keypair } from '@solana/web3.js';
import env from '../config/env';

const connection = new Connection(env.SOLANA_RPC_URL, 'confirmed');

export async function mintNFT(projectId: string, metadataUri: string): Promise<string> {
  // Simulate minting; replace with actual Solana program call
  const mint = Keypair.generate();
  return mint.publicKey.toString();
}