import prisma from '../config/prisma';



export async function getProjectById(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: { documents: true, votes: true },
  });
}

export async function voteOnProject(projectId: string, voterId: string, weight: number) {
  return await prisma.vote.create({
    data: { projectId, voterId, weight },
  });
}


export const createProject = async (
  data: { name: string; description: string; creatorId: string },
  documents: { name: string; url: string }[]
) => {
  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      creator: {
        connectOrCreate: {
          where: { wallet: data.creatorId },
          create: { wallet: data.creatorId },
        },
      },
      documents: {
        create: documents.map(doc => ({
          name: doc.name,
          cid: doc.url, // Assuming 'url' should be used as 'cid'
        })),
      },
    },
    include: {
      documents: true,
    },
  });
};


export const verifyProject = async (projectId: string, approve: boolean, verifierId: string) => {
  // Add verifier authorization logic here
  return await prisma.project.update({
    where: { id: projectId },
    data: { status: approve ? 'APPROVED' : 'REJECTED' },
  });
};