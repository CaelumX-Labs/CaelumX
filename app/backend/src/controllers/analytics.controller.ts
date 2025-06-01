import { Request, Response } from 'express';
import prisma from '../config/prisma';
import * as analyticsService from '../services/analytics.service';

export async function getOverview(req: Request, res: Response) {
  const latest = await prisma.analytics.findFirst({
    where: { type: 'global' },
    orderBy: { timestamp: 'desc' },
  });
  res.json(latest?.data || {});
}

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const data = await analyticsService.getDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};