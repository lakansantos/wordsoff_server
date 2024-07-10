import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET_KEY } from '@configs/environment';
import User from '@models/users/userModel';
import { SERVER_ERROR_MESSAGE } from '@configs/constant';
import { validationErrorMessageMapper } from '@utils/string';
import { Request, Response } from 'express';

const convertToToken = (data: { token_id: string }) => {
  return jwt.sign(data, JWT_SECRET_KEY as string);
};

const loginUser = async (req: Request, res: Response) => {
  const date = new Date(req.rateLimit.resetTime);
  req.rateLimit.resetTime = date.toLocaleTimeString();

  try {
    const { user_name, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password field is required',
      });
    }
    const user = await User.findOne({
      user_name,
    }).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'Incorrect user name or password.',
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Incorrect user name or password.',
      });
    }

    const selectedUser = await User.findOne({ user_name });

    selectedUser.last_logged_in = new Date();
    selectedUser.save();

    return res.status(201).json({
      user_id: selectedUser.user_id,
      last_logged_in: selectedUser.last_logged_in,
      token: convertToToken({ token_id: user._id }),
    });
  } catch (error) {
    const validationError = error as Error;
    if (validationError.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error as Fetch.Error),
      });
    }
    res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const changeUserLoginPassword = async (
  req: Request,
  res: Response,
) => {
  try {
    const token_id = req.token_id;

    const user = await User.findOne({ _id: token_id }).select(
      '+password',
    );

    const { currentPassword, newPassword, confirmPassword } =
      req.body;

    const missingFields: string[] = [];

    ['currentPassword', 'newPassword', 'confirmPassword'].map(
      (field) => {
        if (!req.body[field]) {
          missingFields.push(field);
        }
      },
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing fields: ${missingFields.join(
          ', ',
        )} required`,
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: 'Password is incorrect',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password is equal to current password',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New and confirm password do not match',
      });
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRound);

    await User.findOneAndUpdate(
      { _id: token_id },
      {
        password: hashedPassword,
      },
    );
    res.status(200).json({
      message: 'Password has been changed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      message: {
        SERVER_ERROR_MESSAGE,
        error,
      },
    });
  }
};

export { loginUser, changeUserLoginPassword };
