import User from '@models/users/userModel';
import sendOTP from '@utils/sendOTP';
import { Request, Response } from 'express';

const sendOTPController = async (req: Request, res: Response) => {
  const { email_receiver } = req.body;
  const token_id = req.token_id;

  try {
    const loggedInUser = await User.findById(token_id);

    const user_name = loggedInUser.user_name;
    await sendOTP(user_name, email_receiver);

    return res.status(200).json({
      message: 'OTP sent to email successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

export default sendOTPController;
