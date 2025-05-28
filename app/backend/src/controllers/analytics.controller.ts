import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function getOverview(req: Request, res: Response) {
  const latest = await prisma.analytics.findFirst({
    where: { type: 'global' },
    orderBy: { timestamp: 'desc' },
  });
  res.json(latest?.data || {});
}