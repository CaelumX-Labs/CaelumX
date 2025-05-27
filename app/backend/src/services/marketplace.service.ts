import prisma from '../config/database';

export async function getActiveListings() {
  // Fetch listings where status is ACTIVE
  return prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: {
      nft: true,
      seller: { select: { wallet: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
