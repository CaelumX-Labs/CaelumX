import { Request, Response } from 'express';
import * as solanaService from '../services/solana.service';
import prisma from '../config/prisma';

export async function mintNFT(req: Request, res: Response) {
  const { projectId } = req.body;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.status !== 'APPROVED') {
    return res.status(400).json({ error: 'Project not approved' });
  }
  const metadataUri = 'ipfs://<CID>'; // Placeholder for IPFS upload
  const mintAddress = await solanaService.mintNFT(projectId, metadataUri);
  const nft = await prisma.nFT.create({
    data: {
      mintAddress,
      vintage: new Date(),
      tonnage: 1.0,
      ownerId: project.creatorId,
      metadataCID: metadataUri,
    },
  });
  res.json(nft);
}