import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.get('/analytics/overview', analyticsController.getOverview);

export default router;