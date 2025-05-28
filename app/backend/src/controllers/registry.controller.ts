import { Request, Response } from 'express';
import * as registryService from '../services/registry.service';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      wallet: string;
      // add other properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

export async function createProject(req: Request, res: Response) {
  const { name, description, documents } = req.body;
  const creatorId = req.user!.wallet;
  try {
    const project = await registryService.createProject({ name, description, creatorId }, documents || []);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function getProject(req: Request, res: Response) {
  const { id } = req.params;
  const project = await registryService.getProjectById(id);
  if (project) res.json(project);
  else res.status(404).json({ error: 'Project not found' });
}

export async function voteOnProject(req: Request, res: Response) {
  const { projectId } = req.params;
  const { weight } = req.body;
  const voterId = req.user!.wallet;
  try {
    await registryService.voteOnProject(projectId, voterId, weight);
    res.status(200).json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote' });
  }
}