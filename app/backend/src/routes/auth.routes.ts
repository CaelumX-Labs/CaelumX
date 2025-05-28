import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/auth/challenge', authController.getChallenge);
router.post('/auth/verify', authController.verifySignature);

export default router;