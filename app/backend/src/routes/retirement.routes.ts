import { Router } from 'express';
import * as retirementController from '../controllers/retirement.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/retire', authMiddleware, retirementController.retireNFT);
router.get('/retirements/:id/certificate', retirementController.getCertificate);

export default router;