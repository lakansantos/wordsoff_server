import express from 'express';

import {
  userSendOTPToEmail,
  userVerifyOTPEmail,
} from '@controller/users/usersAddEmailController';
import authMiddleware from '@middlewares/authMiddleware';

const usersAddEmailRouter = express.Router();

usersAddEmailRouter.post(
  '/user/send-otp-email',
  authMiddleware,
  userSendOTPToEmail,
);
usersAddEmailRouter.post(
  '/user/verify-otp-email',
  authMiddleware,
  userVerifyOTPEmail,
);
export default usersAddEmailRouter;
