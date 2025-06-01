import { Connection } from '@solana/web3.js';
import { config } from '../config';

const connection = new Connection(config.solanaRpcUrl, 'confirmed');

export const listenToEvents = () => {
  console.log('Listening to Solana events');
};