import { Router } from 'express';
import { challenge } from '../controllers/auth.controller';
import { getChallenge } from '../controllers/auth.controller';
const router = Router();

router.post('/get-challenge', getChallenge); 
router.post('/challenge', challenge);

export default router;