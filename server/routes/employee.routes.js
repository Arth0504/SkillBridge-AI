import express from 'express';
import {
  autoOnboardCandidateHandler,
  getCompanyEmployeesHandler,
  getEmployeeByIdHandler,
  updateEmployeeHRFieldsHandler,
} from '../controllers/employee.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);

router.post('/onboard', restrictTo(ROLES.COMPANY), autoOnboardCandidateHandler);
router.get('/', restrictTo(ROLES.COMPANY), getCompanyEmployeesHandler);
router.get('/:id', getEmployeeByIdHandler);
router.patch('/:id', restrictTo(ROLES.COMPANY), updateEmployeeHRFieldsHandler);

export default router;
