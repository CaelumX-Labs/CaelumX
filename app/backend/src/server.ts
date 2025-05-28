import express from 'express';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import env from './config/env';

const app = express();

app.use(express.json());
app.use(rateLimiter);
app.use('/api', router);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});