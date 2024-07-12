import sendEmailMessage from '@controller/email/emailSendController';
import authMiddleware from '@middlewares/authMiddleware';
import express from 'express';

const emailSendRouter = express.Router();

emailSendRouter.post('/send-email', authMiddleware, sendEmailMessage);

export default emailSendRouter;
