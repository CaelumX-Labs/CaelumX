import prisma from '../config/prisma';

export const getDashboardData = async () => {
  const credits = await prisma.nFT.count();
  const transactions = await prisma.purchase.count();
  const retirements = await prisma.retirement.count();
  return { credits, transactions, retirements };
};