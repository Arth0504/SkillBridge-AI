import express from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadLogo,
  getPublicCompanyProfile,
} from '../controllers/profileCompany.controller.js';
import { validateCompanyProfileUpdate } from '../validations/profileCompany.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { uploadLogo as uploadLogoMiddleware } from '../middleware/upload.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public company profile endpoint (Unrestricted)
router.get('/public/:id', getPublicCompanyProfile);

// Protected company profile endpoints
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

router.get('/', getCompanyProfile);
router.put('/', validateCompanyProfileUpdate, updateCompanyProfile);
router.post('/logo', uploadLogoMiddleware.single('logo'), uploadLogo);

export default router;
