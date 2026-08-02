import express from 'express';
import multer from 'multer';
import {
  uploadDocumentHandler,
  getDocumentsHandler,
  deleteDocumentHandler,
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadDocumentHandler);
router.get('/', getDocumentsHandler);
router.delete('/:id', deleteDocumentHandler);

export default router;
