import prisma from '../config/prisma';

export const retireNFT = async (nftId: string, userId: string, txSignature: string) => {
  return await prisma.retirement.create({
    data: {
      nftId,
      retiredAt: new Date(),
      txSignature,
      userId,
    },
  });
};