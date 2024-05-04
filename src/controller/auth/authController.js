import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../../config/environment.js';
import User from '../../models/users/userModel.js';
import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';

const convertToToken = (data) => {
  return jwt.sign(data, JWT_SECRET_KEY);
};

const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName });

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
      user_id: user._id,
      token: convertToToken({ id: user._id }),
    });
  } catch (error) {
    res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { loginUser };
