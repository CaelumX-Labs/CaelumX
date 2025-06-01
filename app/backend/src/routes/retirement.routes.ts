import { Router } from 'express';
import * as retirementController from '../controllers/retirement.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/retire', authenticate, retirementController.retireNFT);
router.get('/retirements/:id/certificate', retirementController.getCertificate);

export default router;