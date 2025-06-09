import * as solanaService from '../services/solana.service';
import { Request, Response } from 'express';
import * as registryService from '../services/registry.service';
import { upload } from '../middlewares/upload'; // Import multer config
import * as fs from 'fs';
import * as path from 'path';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      wallet: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export async function createProject(req: Request, res: Response) {
  const { name, description, documents } = req.body;
  const creatorId = req.user?.wallet || 'Gjgvx2rJpkD4bwr6rRkMDXzVdwYBiPf1ayzhatceZ4di'; // Mock here
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

export const submitProject = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const creatorId = req.user?.wallet;

  // Authentication check
  if (!creatorId) {
    return res.status(401).json({ error: 'Unauthorized: Wallet not found. Please authenticate first.' });
  }

  // Validate required fields
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  // Get uploaded files
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'At least one document is required' });
  }

  try {
    // Ensure uploads directory exists
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Save files locally and get their URLs
    const documents = files.map((file) => {
      const filePath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      // Assuming the files are served statically from /uploads
      const url = `/uploads/${file.originalname}`;
      return { name: file.originalname, url };
    });

    // Create project in the database with file URLs
    const project = await registryService.createProject({ name, description, creatorId }, documents);

    // Submit to Solana blockchain
    const txSignature = await solanaService.submitProject(project.id, { name, description });

    res.status(201).json({ project, txSignature });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const verifyProject = async (req: Request, res: Response) => {
  const { projectId, approve } = req.body;
  const verifierId = req.user!.wallet;
  try {
    const updatedProject = await registryService.verifyProject(projectId, approve, verifierId);
    const txSignature = await solanaService.updateProjectStatus(projectId, approve ? 'APPROVED' : 'REJECTED');
    res.json({ updatedProject, txSignature });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};