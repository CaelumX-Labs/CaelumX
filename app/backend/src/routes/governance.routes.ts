import { Router } from 'express';
import { createProposal } from '../controllers/governance.controller';

const router = Router();

router.post('/proposals', createProposal);

export default router;