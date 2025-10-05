import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.purchase.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.retirement.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.document.deleteMany();
  await prisma.nFT.deleteMany();
  await prisma.project.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.stake.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log('👥 Creating users...');
  const user1 = await prisma.user.create({
    data: {
      wallet: 'Gjgvx2rJpkD4bwr6rRkMDXzVdwYBiPf1ayzhatceZ4di',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      wallet: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      wallet: 'DjVE6JNiYqPL2QXyCeHdH48eVwxoSK5RcGiGvBPh8X9Z',
    },
  });

  console.log(`✅ Created ${[user1, user2, user3].length} users`);

  // Create balances for users
  console.log('💰 Creating balances...');
  await prisma.balance.createMany({
    data: [
      { userId: user1.id, amount: 1000 },
      { userId: user2.id, amount: 2500 },
      { userId: user3.id, amount: 750 },
    ],
  });

  // Create projects
  console.log('📋 Creating projects...');
  const project1 = await prisma.project.create({
    data: {
      name: 'Amazon Rainforest Conservation',
      description: 'A large-scale forest conservation project in the Amazon rainforest, focusing on preventing deforestation and protecting biodiversity.',
      creatorId: user1.wallet,
      status: 'APPROVED',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Solar Farm Initiative',
      description: 'Development of solar energy infrastructure to replace fossil fuel-based energy generation in rural communities.',
      creatorId: user2.wallet,
      status: 'PENDING',
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Ocean Plastic Cleanup',
      description: 'Marine conservation project focused on removing plastic waste from ocean environments and preventing further pollution.',
      creatorId: user3.wallet,
      status: 'REJECTED',
    },
  });

  console.log(`✅ Created ${[project1, project2, project3].length} projects`);

  // Create documents for projects
  console.log('📄 Creating documents...');
  await prisma.document.createMany({
    data: [
      {
        projectId: project1.id,
        cid: 'QmExampleCID1ForAmazonProject',
        name: 'Amazon_Conservation_Plan.pdf',
      },
      {
        projectId: project1.id,
        cid: 'QmExampleCID2ForAmazonProject',
        name: 'Environmental_Impact_Assessment.pdf',
      },
      {
        projectId: project2.id,
        cid: 'QmExampleCID1ForSolarProject',
        name: 'Solar_Technical_Specifications.pdf',
      },
      {
        projectId: project3.id,
        cid: 'QmExampleCID1ForOceanProject',
        name: 'Ocean_Cleanup_Methodology.pdf',
      },
    ],
  });

  // Create votes for projects
  console.log('🗳️ Creating votes...');
  await prisma.vote.createMany({
    data: [
      { projectId: project1.id, voterId: user2.id, weight: 10 },
      { projectId: project1.id, voterId: user3.id, weight: 8 },
      { projectId: project2.id, voterId: user1.id, weight: 7 },
      { projectId: project2.id, voterId: user3.id, weight: 9 },
      { projectId: project3.id, voterId: user1.id, weight: 3 },
      { projectId: project3.id, voterId: user2.id, weight: 4 },
    ],
  });

  // Create NFTs
  console.log('🎨 Creating NFTs...');
  const nft1 = await prisma.nFT.create({
    data: {
      mintAddress: 'NFTMint1ExampleAddressForTesting123456789',
      vintage: new Date('2023-01-01'),
      tonnage: 5.5,
      ownerId: user1.id,
      metadataCID: 'QmNFTMetadata1ExampleCID',
      burned: false,
    },
  });

  const nft2 = await prisma.nFT.create({
    data: {
      mintAddress: 'NFTMint2ExampleAddressForTesting123456789',
      vintage: new Date('2023-06-15'),
      tonnage: 10.0,
      ownerId: user2.id,
      metadataCID: 'QmNFTMetadata2ExampleCID',
      burned: false,
    },
  });

  const nft3 = await prisma.nFT.create({
    data: {
      mintAddress: 'NFTMint3ExampleAddressForTesting123456789',
      vintage: new Date('2022-12-01'),
      tonnage: 2.5,
      ownerId: user3.id,
      metadataCID: 'QmNFTMetadata3ExampleCID',
      burned: true,
    },
  });

  console.log(`✅ Created ${[nft1, nft2, nft3].length} NFTs`);

  // Create listings
  console.log('🏪 Creating marketplace listings...');
  const listing1 = await prisma.listing.create({
    data: {
      nftId: nft1.id,
      sellerId: user1.id,
      priceLamports: BigInt(1000000000), // 1 SOL in lamports
      status: 'ACTIVE',
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      nftId: nft2.id,
      sellerId: user2.id,
      priceLamports: BigInt(2500000000), // 2.5 SOL in lamports
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created ${[listing1, listing2].length} active listings`);

  // Create a sold listing and purchase
  const soldListing = await prisma.listing.create({
    data: {
      nftId: nft3.id,
      sellerId: user3.id,
      priceLamports: BigInt(750000000), // 0.75 SOL in lamports
      status: 'SOLD',
    },
  });

  const purchase1 = await prisma.purchase.create({
    data: {
      listingId: soldListing.id,
      buyerId: user1.id,
      priceLamports: BigInt(750000000),
    },
  });

  console.log(`✅ Created 1 sold listing with purchase`);

  // Create retirement
  console.log('🔥 Creating retirement...');
  const retirement1 = await prisma.retirement.create({
    data: {
      nftId: nft3.id,
      retiredAt: new Date(),
      txSignature: 'ExampleTransactionSignatureForRetirement123456789',
      userId: user1.id,
    },
  });

  console.log(`✅ Created 1 retirement`);

  // Create proposals
  console.log('🏛️ Creating governance proposals...');
  const proposal1 = await prisma.proposal.create({
    data: {
      title: 'Increase Carbon Credit Standards',
      description: 'Proposal to implement stricter verification standards for carbon credit projects to ensure higher environmental impact.',
      creatorId: user1.id,
      status: 'ACTIVE',
    },
  });

  const proposal2 = await prisma.proposal.create({
    data: {
      title: 'Reduce Platform Fees',
      description: 'Proposal to reduce marketplace transaction fees from 2.5% to 1.5% to encourage more trading activity.',
      creatorId: user2.id,
      status: 'APPROVED',
    },
  });

  console.log(`✅ Created ${[proposal1, proposal2].length} proposals`);

  // Create stakes
  console.log('🔒 Creating stakes...');
  await prisma.stake.createMany({
    data: [
      { userId: user1.id, amount: BigInt(5000000000) }, // 5 SOL staked
      { userId: user2.id, amount: BigInt(3000000000) }, // 3 SOL staked
      { userId: user3.id, amount: BigInt(1500000000) }, // 1.5 SOL staked
    ],
  });

  // Create fees
  console.log('💸 Creating fees...');
  await prisma.fee.createMany({
    data: [
      { userId: user1.id, amount: BigInt(25000000) }, // 0.025 SOL fee
      { userId: user2.id, amount: BigInt(62500000) }, // 0.0625 SOL fee
      { userId: user3.id, amount: BigInt(18750000) }, // 0.01875 SOL fee
    ],
  });

  // Create analytics
  console.log('📊 Creating analytics...');
  await prisma.analytics.createMany({
    data: [
      {
        type: 'daily_transactions',
        data: { count: 25, volume: 15.5, date: '2024-10-01' },
      },
      {
        type: 'daily_transactions',
        data: { count: 30, volume: 18.2, date: '2024-10-02' },
      },
      {
        type: 'project_approval_rate',
        data: { approved: 12, rejected: 3, pending: 8, rate: 0.8 },
      },
      {
        type: 'carbon_credits_retired',
        data: { total_tonnage: 125.5, total_count: 45 },
      },
    ],
  });

  console.log('🎉 Database seeding completed successfully!');
  
  // Print summary
  console.log('\n📈 Seeding Summary:');
  console.log('==================');
  console.log(`👥 Users: 3`);
  console.log(`📋 Projects: 3 (1 approved, 1 pending, 1 rejected)`);
  console.log(`📄 Documents: 4`);
  console.log(`🗳️ Votes: 6`);
  console.log(`🎨 NFTs: 3 (2 active, 1 burned)`);
  console.log(`🏪 Listings: 3 (2 active, 1 sold)`);
  console.log(`💰 Purchases: 1`);
  console.log(`🔥 Retirements: 1`);
  console.log(`🏛️ Proposals: 2`);
  console.log(`💸 Analytics: 4 records`);
  console.log('\n✨ You can now test your API endpoints!');
  
  console.log('\n🔧 Test wallet addresses:');
  console.log('- User 1:', user1.wallet);
  console.log('- User 2:', user2.wallet);
  console.log('- User 3:', user3.wallet);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
