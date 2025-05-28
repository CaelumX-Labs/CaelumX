import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplace.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/listings', authMiddleware, marketplaceController.createListing);
router.get('/listings', marketplaceController.getListings);
router.post('/hooks/tx', marketplaceController.handleTradeWebhook);

export default router;