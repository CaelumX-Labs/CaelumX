// import { Router } from 'express';
// import portfolioController from '../controllers/portfolio.controller';
// import marketplaceController from '../controllers/marketplace.controller';

// const router = Router();

// // Mount controllers
// router.use('/portfolio', portfolioController);
// router.use('/marketplace', marketplaceController);

// export default router;
import { Router } from 'express';
import authRoutes from './auth.routes';
import registryRoutes from './registry.routes';
import tokenizationRoutes from './tokenization.routes';
import marketplaceRoutes from './marketplace.routes';
import retirementRoutes from './retirement.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.get('/healthz', (req, res) => res.status(200).send('OK'));
router.use(authRoutes);
router.use(registryRoutes);
router.use(tokenizationRoutes);
router.use(marketplaceRoutes);
router.use(retirementRoutes);
router.use(analyticsRoutes);

export { router };