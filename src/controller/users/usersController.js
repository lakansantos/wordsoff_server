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

    const _limit = parseInt(limit);
    const response = await User.aggregate([
      { $match: query },
      {
        $facet: {
          meta: [
            { $count: 'total_rows' },
            {
              $addFields: {
                total_pages: {
                  $ceil: { $divide: ['$total_rows', _limit] },
                },
                limit: _limit,
                offset: parseInt(offset),
              },
            },
          ],
          data: [
            {
              $sort: { created_at: -1 },
            },
            { $skip: offset * _limit },
            { $limit: _limit },
            { $project: { password: 0, _id: 0, __v: 0 } },
          ],
        },
      },
    ]);

    const [{ data = [], meta }] = response;
    return res.status(200).json({
      data,
      meta: meta[0] || {
        limit: limit,
        offset: offset,
        total_pages: 0,
        total_rows: 0,
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
    const { user_name, gender, about, password } = req.body;

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
      gender: gender,
      password: hashedSaltedPassword,
      about: about,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        user_name: newUser.user_name,
        gender: newUser.gender,
        user_id: newUser.user_id,
        about: newUser.about,
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
  const { userName } = req.params;

  try {
    const user = await User.findOne(
      { user_name: userName },
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
