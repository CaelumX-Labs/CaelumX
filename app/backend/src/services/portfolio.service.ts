import prisma from '../config';

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
export const getPortfolio = async (userId: string) => {
  return { message: 'Not implemented' };
};