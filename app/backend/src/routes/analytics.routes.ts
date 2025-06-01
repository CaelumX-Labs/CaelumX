import { Router } from 'express';
import { getDashboardData } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/dashboard', authenticate, getDashboardData);

export default router;