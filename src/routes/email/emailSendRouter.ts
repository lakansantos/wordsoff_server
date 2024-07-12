import sendOTPController from '@controller/email/emailSendController';
import authMiddleware from '@middlewares/authMiddleware';
import express from 'express';

const emailSendRouter = express.Router();

emailSendRouter.post(
  '/send-otp-email',
  authMiddleware,
  sendOTPController,
);

export default emailSendRouter;
