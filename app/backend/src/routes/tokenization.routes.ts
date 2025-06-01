import { Router } from 'express';
import { mintNFT } from '../controllers/tokenization.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/mint', authenticate, mintNFT);

export default router;