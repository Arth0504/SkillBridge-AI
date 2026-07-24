import express from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadLogo,
} from '../controllers/profileCompany.controller.js';
import { validateCompanyProfileUpdate } from '../validations/profileCompany.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All profile endpoints require company authentication
router.use(protect);
router.use(restrictTo(ROLES.COMPANY));

router.get('/', getCompanyProfile);
router.put('/', validateCompanyProfileUpdate, updateCompanyProfile);
router.post('/logo', upload.single('logo'), uploadLogo);

export default router;
