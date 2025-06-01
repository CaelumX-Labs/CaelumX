import { Router } from 'express';
import { createListing, getListings } from '../controllers/marketplace.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/listings', authenticate, createListing);
router.get('/listings', getListings);

export default router;