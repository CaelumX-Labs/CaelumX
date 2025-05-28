import { Router } from 'express';
import * as registryController from '../controllers/registry.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/projects', authMiddleware, registryController.createProject);
router.get('/projects/:id', registryController.getProject);
router.post('/projects/:projectId/vote', authMiddleware, registryController.voteOnProject);

export default router;