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
  headerText = "You requested to send OTP in your Wordsoff account. If it wasn't you, please reset your account immediately",
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
      <p>${headerText}</p>

      <div style="border:2px solid #0077c0;max-width:80%;border-radius:10px;padding:10px 25px;text-align:center;font-size:32px;letter-spacing:14px;color:#0077c0;font-weight:600;margin:0 auto;margin-top:2rem;margin-bottom:2rem">${otp}</div>

     <p><strong>*Please note that the code expires in 5 minutes.</strong></p>

     <p>Do not share this OTP to anyone.</p>
        </div>
        `,
    });
    return { info, otp };
  } catch (error) {
    throw new Error(error as string);
  }
};

export default sendOTP;
