import { Router } from 'express';
import { submitProject, verifyProject } from '../controllers/registry.controller';
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

export default router;
