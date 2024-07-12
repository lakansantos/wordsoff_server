import User from '@models/users/userModel';
import sendOTP from '@utils/sendOTP';
import {
  REGEXP_FEEDBACK,
  REGEXP,
  validationErrorMessageMapper,
} from '@utils/string';
import { Request, Response } from 'express';

type OTPStorageType = {
  [key: string]: { otp: string; timestamp: number };
};
const OTPStorage: OTPStorageType = {};

const userSendOTPToEmail = async (req: Request, res: Response) => {
  try {
    const { email_to_add } = req.body;

    const token_id = req.token_id;

    const thisUser = await User.findById(token_id);

    const user_name = thisUser.user_name;

    if (!email_to_add) {
      return res.status(400).json({ message: REGEXP_FEEDBACK.email });
    }

    if (!REGEXP['email'].test(email_to_add as string)) {
      return res
        .status(400)
        .json({ message: 'Invalid email format' });
    }

    const { otp } = await sendOTP(user_name, email_to_add);

    OTPStorage[email_to_add] = { otp, timestamp: Date.now() };
    console.log(OTPStorage);
    return res.status(200).json({
      message: 'OTP sent successfully.',
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const userVerifyOTPEmail = async (req: Request, res: Response) => {
  const { email_to_verify, otp } = req.body;

  try {
    const token_id = req.token_id;

    console.log(email_to_verify);
    console.log(OTPStorage);
    console.log(OTPStorage[email_to_verify]);

    const emailData = OTPStorage[email_to_verify];
    if (!emailData) {
      return res.status(400).json({
        message: 'Invalid Email Recipient. Please try again',
      });
    }

    if (emailData.otp !== otp) {
      return res.status(400).json({
        message: 'OTP is incorrect. Please try again.',
      });
    }

    if (emailData.timestamp < Date.now()) {
      return res.status(400).json({
        message: 'OTP Expired. Please generate again. ',
      });
    }

    await User.findByIdAndUpdate(token_id, {
      email: email_to_verify,
    });

    delete OTPStorage[email_to_verify];

    console.log(OTPStorage);
    return res.status(200).json({
      message: 'Added Email successfully!',
    });
  } catch (error) {
    const validationError = error as Fetch.Errors;
    if (validationError.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error as Fetch.Error),
      });
    }
  }
};

export { userSendOTPToEmail, userVerifyOTPEmail };
