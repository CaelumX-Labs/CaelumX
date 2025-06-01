import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  SOLANA_RPC_URL: z.string(),
  PORT: z.string().default('3000'),
});

const env = envSchema.parse(process.env);


export default env;
