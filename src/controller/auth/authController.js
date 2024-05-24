import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../../config/environment.js';
import User from '../../models/users/userModel.js';
import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import { validationErrorMessageMapper } from '../../utils/string.js';

const convertToToken = (data) => {
  return jwt.sign(data, JWT_SECRET_KEY);
};

const loginUser = async (req, res) => {
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
        message: 'User does not exist.',
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Incorrect Password',
      });
    }

    await User.findOneAndUpdate(
      { user_name },
      { last_logged_in: new Date() },
    );

    return res.status(201).json({
      user_id: user.user_id,
      last_logged_in: user.last_logged_in,
      token: convertToToken({ token_id: user._id }),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error),
      });
    }
    res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const changeUserLoginPassword = async (req, res) => {
  try {
    const token_id = req.token_id;

    const user = await User.findOne({ _id: token_id }).select(
      '+password',
    );
    const { currentPassword, newPassword, confirmPassword } =
      req.body;

    const missingFields = [];

    [('currentPassword', 'newPassword', 'confirmPassword')].map(
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
