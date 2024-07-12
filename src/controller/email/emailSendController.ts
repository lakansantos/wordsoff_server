import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import { EMAIL_PASS, EMAIL_USER } from '@configs/environment';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmailMessage = async (req: Request, res: Response) => {
  const { email_receiver } = req.body;
  try {
    console.log(email_receiver);
    const info = await transporter.sendMail({
      from: `${EMAIL_USER}`,
      to: email_receiver,
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: '<b>Hello world?</b>', // html body
    });

    return res.status(200).json({
      info,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

export default sendEmailMessage;
