import { Router, Request, Response } from 'express';
import * as marketplaceService from '../services/marketplace.service';

const router = Router();

/**
 * GET /api/marketplace
 * Returns all active listings.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const listings = await marketplaceService.getActiveListings();
    res.json(listings);
  } catch (err) {
    console.error('Marketplace fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
});

export default router;
