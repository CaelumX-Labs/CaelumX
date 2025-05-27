import { Router, Request, Response } from 'express';
import * as portfolioService from '../services/portfolio.service';

const router = Router();

/**
 * GET /api/portfolio/:wallet
 * Returns a user’s current balances and NFT holdings.
 */
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const data = await portfolioService.getUserPortfolio(wallet);
    res.json(data);
  } catch (err) {
    console.error('Portfolio fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

export default router;
