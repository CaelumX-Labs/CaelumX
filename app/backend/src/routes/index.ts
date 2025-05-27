import { Router } from 'express';
import portfolioController from '../controllers/portfolio.controller';
import marketplaceController from '../controllers/marketplace.controller';

const router = Router();

// Mount controllers
router.use('/portfolio', portfolioController);
router.use('/marketplace', marketplaceController);

export default router;
