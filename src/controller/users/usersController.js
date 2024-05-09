import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import User from '../../models/users/userModel.js';
import bcrypt from 'bcryptjs';
import { validationErrorMessageMapper } from '../../utils/string.js';

const excludedFields = { password: 0, _id: 0, __v: 0 };

const getUsers = async (req, res) => {
  try {
    const { limit = 5, offset = 0, search } = req.query;

    const regexSearch = new RegExp(search, 'i');
    const query = search
      ? { user_name: { $regex: regexSearch } }
      : {};

    const total_rows = await User.countDocuments(query);
    const total_pages = Math.ceil(total_rows / limit);
    const skipIndex = offset * limit;
    const usersData = await User.find(query, excludedFields)
      .sort({
        created_at: 'desc',
      })
      .skip(skipIndex)
      .limit(limit);

    return res.status(200).json({
      data: usersData,
      meta: {
        total_rows,
        total_pages,
        limit,
        offset,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: { SERVER_ERROR_MESSAGE, error },
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { user_name, first_name, last_name, password } = req.body;

    const isUserNameExist = await User.findOne({
      user_name: user_name.trim(),
    });

    if (!password) {
      return res
        .status(400)
        .json({ message: 'Password field is missing' });
    }
    if (isUserNameExist)
      return res.status(400).json({
        message: 'Username is already taken.',
      });

    const saltRound = 10;
    const hashedSaltedPassword = await bcrypt.hash(
      password,
      saltRound,
    );

    const newUser = new User({
      user_name: user_name.trim(), // user_name should be trimmed so that it can be unique and removes whitespaces.
      first_name: first_name,
      last_name: last_name,
      password: hashedSaltedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        user_name: newUser.user_name,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        user_id: newUser.user_id,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error),
      });
    }
    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const viewUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne(
      { user_id: userId },
      excludedFields,
    );

    if (!user)
      return res.status(404).json({
        message: 'User not found.',
      });

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: {
        error,
        SERVER_ERROR_MESSAGE,
      },
    });
  }
};

export { getUsers, registerUser, viewUser };
