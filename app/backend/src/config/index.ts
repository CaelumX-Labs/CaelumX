import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import env from './env';

export const config = {
    port: parseInt(env.PORT, 10),
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    jwtSecret: env.JWT_SECRET,
    solanaRpcUrl: env.SOLANA_RPC_URL,
};
export default prisma;