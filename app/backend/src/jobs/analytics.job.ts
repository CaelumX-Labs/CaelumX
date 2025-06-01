import prisma from '../config/prisma';

export async function computeDailyAnalytics() {
  const totalRetired = await prisma.retirement.count();
  await prisma.analytics.create({
    data: {
      type: 'global',
      data: { totalRetired },
      timestamp: new Date(),
    },
  });
}
export const updateAnalytics = async () => {
  console.log('Analytics update job running');
};