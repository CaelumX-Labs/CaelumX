import { Router } from 'express';
import * as tokenizationController from '../controllers/tokenization.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/mint', authMiddleware, tokenizationController.mintNFT);

export default router;