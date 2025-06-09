import { Router } from 'express';
import { submitProject, verifyProject, getProject, voteOnProject } from '../controllers/registry.controller';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.post(
  '/projects',
  upload.array('documents', 10), 
  authenticate,// Accept up to 10 files
  submitProject
);
router.post('/projects/verify', authenticate, verifyProject);
router.get('/projects/:id', getProject);
router.post('/projects/:id/vote', authenticate, voteOnProject);
export default router;
