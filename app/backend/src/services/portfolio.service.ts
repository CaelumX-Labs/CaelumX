import prisma from '../config/database';

export async function getUserPortfolio(wallet: string) {
  // Fetch user by wallet, include balances and NFTs
  const user = await prisma.user.findUnique({
    where: { wallet },
    include: {
      balances: true,
      nftTokens: true,
    },
  });

  if (!user) {
    throw new Error(`User with wallet ${wallet} not found`);
  }

  return {
    wallet: user.wallet,
    balances: user.balances,
    nfts: user.nftTokens,
  };
}
