import { PublicKey, Connection, Transaction, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';

/**
 * CaelumX Blockchain Types
 * 
 * Type definitions for blockchain interactions and data structures
 * used throughout the CaelumX platform.
 */

// Solana Network Configuration
export type NetworkConfig = {
  endpoint: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
  programId: PublicKey;
  ammProgramId: PublicKey;
  tokenProgramId: PublicKey;
  metadataProgramId: PublicKey;
};

// Transaction Status and Results
export type TransactionResult = {
  signature: string;
  confirmed: boolean;
  slot?: number;
  error?: string;
  confirmations?: number;
};

// Carbon Credit Token Types
export enum TokenType {
  NFT = 'NFT',    // Non-fungible (unique) carbon credit
  SFT = 'SFT',    // Semi-fungible (batch) carbon credit
  FT = 'FT'       // Fungible (fractionalized) carbon credit
}

// Carbon Credit Metadata
export type CarbonCreditMetadata = {
  name: string;
  symbol: string;
  description: string;
  projectId: string;
  vintage: number;
  standard: string;  // e.g., "Verra", "Gold Standard"
  creditType: string; // e.g., "Forestry", "Renewable Energy"
  quantity: number;   // Tons of CO2e
  serialNumber?: string;
  verificationDate: number; // Unix timestamp
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  externalUri?: string;
  image?: string;
  ipfsHash?: string;
  arweaveHash?: string;
};

// Mint Parameters
export type MintParams = {
  recipient: PublicKey;
  projectId: string;
  tokenType: TokenType;
  quantity: number;
  metadata: CarbonCreditMetadata;
};

// Retirement Parameters
export type RetirementParams = {
  tokenMint: PublicKey;
  owner: PublicKey;
  quantity: number;
  beneficiaryName?: string;
  retirementMessage?: string;
  retirementPurpose?: string;
};

// Listing Parameters
export type ListingParams = {
  tokenMint: PublicKey;
  seller: PublicKey;
  price: BN;
  quantity: number;
};

// Oracle Data Structure
export type OracleData = {
  projectId: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  verifier: string;
  signature: string;
  data: Record<string, any>;
};

// Transaction Queue Item
export type TransactionQueueItem = {
  id: string;
  transaction: Transaction | TransactionInstruction[];
  signers?: any[];
  priority: 'high' | 'medium' | 'low';
  retries: number;
  maxRetries: number;
  lastAttempt?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: TransactionResult;
  createdAt: number;
};

// Circuit Breaker Conditions
export type CircuitBreakerCondition = {
  metric: 'price' | 'volume' | 'error_rate' | 'latency';
  threshold: number;
  timeWindow: number; // in milliseconds
  action: 'pause' | 'throttle' | 'alert';
};

// Blockchain Event Types
export enum BlockchainEventType {
  MINT = 'mint',
  TRADE = 'trade',
  RETIRE = 'retire',
  LIST = 'list',
  DELIST = 'delist',
  TRANSFER = 'transfer',
  FRACTIONALIZE = 'fractionalize',
  GOVERNANCE_VOTE = 'governance_vote'
}

// Blockchain Event
export type BlockchainEvent = {
  type: BlockchainEventType;
  signature: string;
  timestamp: number;
  slot: number;
  accounts: PublicKey[];
  data: any;
};
