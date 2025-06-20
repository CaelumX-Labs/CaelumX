import prisma from '../config/prisma';





export async function handleTradeEvent(event: { listingId: string; buyerId: string; price: number }) {
  const purchase = await prisma.purchase.create({
    data: {
      listingId: event.listingId,
      buyerId: event.buyerId,
      priceLamports: BigInt(event.price),
    },
  });
  await prisma.listing.update({
    where: { id: event.listingId },
    data: { status: 'SOLD' },
  });
  return purchase;
}

export const createListing = async (nftId: string, price: number, sellerId: string) => {
  return await prisma.listing.create({
    data: {
      nftId,
      sellerId,
      priceLamports: BigInt(price),
      status: 'ACTIVE',
    },
  });
};

export const getListings = async () => {
  return await prisma.listing.findMany({ where: { status: 'ACTIVE' } });
};