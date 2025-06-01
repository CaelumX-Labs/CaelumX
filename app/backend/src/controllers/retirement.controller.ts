import { Request, Response } from 'express';
import * as solanaService from '../services/solana.service';
import prisma from '../config/prisma';
import { generateCertificate } from '../utils/pdfGenerator';

export const retireNFT = async (req: Request, res: Response) => {
  const { nftId } = req.body;
  const userId = req.user!.wallet;
  try {
    const nft = await prisma.nFT.findUnique({ where: { id: nftId } });
    if (!nft || nft.ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const txSignature = await solanaService.burnNFT(nft.mintAddress);
    const retirement = await prisma.retirement.create({
      data: {
        nftId,
        retiredAt: new Date(),
        txSignature,
        userId,
      },
    });
    await prisma.nFT.update({ where: { id: nftId }, data: { burned: true } });
    const pdfBuffer = await generateCertificate(retirement);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export async function getCertificate(req: Request, res: Response) {
  const { id } = req.params;
  const retirement = await prisma.retirement.findUnique({ where: { id }, include: { nft: true } });
  if (!retirement) return res.status(404).json({ error: 'Not found' });
  const pdfBuffer = await generateCertificate(retirement);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
}