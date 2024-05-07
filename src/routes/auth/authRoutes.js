import express from 'express';
import {
  loginUser,
  changeUserLoginPassword,
} from '../../controller/auth/authController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();
router.post('/login', loginUser);
router.post(
  '/change-password',
  authMiddleware,
  changeUserLoginPassword,
);

export default router;
