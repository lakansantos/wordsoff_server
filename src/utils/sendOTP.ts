import { EMAIL_PASS, EMAIL_USER } from '@configs/environment';
import nodemailer from 'nodemailer';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

const sendOTP = async (
  user_name: string,
  recepient_email: string,
  text = "You requested to send OTP in your Wordsoff account. If it wasn't you, please reset your account immediately",
) => {
  const otp = generateOTP();
  try {
    const info = await transporter.sendMail({
      from: `${EMAIL_USER}`,
      to: recepient_email,
      subject: 'OTP Request',
      text: `Your code is ${otp}`,
      html: `
        <div>
      <p>Hi ${user_name}, </p> 
      <p>${text}</p>
        <b> 
      ${otp}
      </b>
        </div>
        `, // html body
    });
    return { info, otp };
  } catch (error) {
    throw new Error(error as string);
  }
};

export default sendOTP;
