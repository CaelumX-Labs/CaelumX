import prisma from '../config/prisma';

export async function createProject(data: { name: string; description: string; creatorId: string }, documents: { cid: string; name: string }[]) {
  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      creatorId: data.creatorId,
      documents: { create: documents },
    },
    include: { documents: true },
  });
}

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