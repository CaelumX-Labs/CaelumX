import { Request, Response } from 'express';
import * as marketplaceService from '../services/marketplace.service';

export async function createListing(req: Request, res: Response) {
  const { nftId, price } = req.body;
  const sellerId = req.user!.wallet;
  try {
    const listing = await marketplaceService.createListing(nftId, price, sellerId);
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
}

export async function getListings(req: Request, res: Response) {
  const listings = await marketplaceService.getListings();
  res.json(listings);
}

export async function handleTradeWebhook(req: Request, res: Response) {
  const event = req.body;
  await marketplaceService.handleTradeEvent(event);
  res.status(200).send('OK');
}