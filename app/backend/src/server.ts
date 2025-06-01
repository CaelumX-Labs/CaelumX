import app from './app';
import { config } from './config';
import logger from './config/logger';
import fs from 'fs';
import path from 'path';

const PORT = config.port;

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});