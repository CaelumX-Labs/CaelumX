import { Router } from 'express';
import { challenge } from '../controllers/auth.controller';
import { getChallenge } from '../controllers/auth.controller';
import { verifySignature } from '../controllers/auth.controller';

const router = Router();

router.post('/get-challenge', getChallenge); 
router.post('/challenge', challenge);
router.post('/verify', verifySignature); // Assuming this is the correct route for signature verification

export default router;