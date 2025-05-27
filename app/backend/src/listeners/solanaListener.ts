import { Connection, PublicKey, ParsedInstruction, ParsedTransaction } from '@solana/web3.js';
import prisma from '../config/database';

const RPC_URL = process.env.SOLANA_RPC_URL!;
const PROGRAM_ID = new PublicKey(process.env.CAELUMX_PROGRAM_ID!);
const connection = new Connection(RPC_URL, 'confirmed');

export async function listen() {
  console.log('Starting Solana listener for program', PROGRAM_ID.toBase58());

  connection.onLogs(PROGRAM_ID, async (logs, ctx) => {
    console.log('New on-chain log:', logs);

    // TODO: parse logs or subscribe to parsed transactions
    // Example: if a mint event, write to prisma.nFT.create(...)
    // if a burn event, write to prisma.retirement.create(...)
  });
}
