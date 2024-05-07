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
  try {
    const { user_name, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password field is required',
      });
    }
    const user = await User.findOne({ user_name });

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

    return res.status(201).json({
      user_id: user.user_id,
      token: convertToToken({ user_id: user.user_id }),
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

export { loginUser };
