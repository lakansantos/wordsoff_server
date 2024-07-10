import express from 'express';

import authMiddleware from '@middlewares/authMiddleware';
import limiter from '@middlewares/authLimiterMiddleware';
import {
  changeUserLoginPassword,
  loginUser,
} from 'controller/auth/authController';

const authRouter = express.Router();
authRouter.post('/login', limiter, loginUser);
authRouter.post(
  '/change-password',
  authMiddleware,
  changeUserLoginPassword,
);

export default authRouter;
