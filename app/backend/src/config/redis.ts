import { createClient } from 'redis';
import { config } from './index';

const redis = config.redisUrl ? createClient({ url: config.redisUrl }) : null;

if (redis) {
  redis.on('error', (err) => console.error('Redis Client Error', err));
  redis.connect();
}

export default redis;