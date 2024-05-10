import express from 'express';
import {
  loginUser,
  changeUserLoginPassword,
} from '../../controller/auth/authController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import limiter from '../../middleware/authLimiterMiddleware.js';
const router = express.Router();

router.post('/login', limiter, loginUser);
router.post(
  '/change-password',
  authMiddleware,
  changeUserLoginPassword,
);

export default router;
