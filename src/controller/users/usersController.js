import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import User from '../../models/users/userModel.js';
import bcrypt from 'bcryptjs';

const excludedFields = { password: 0, _id: 0, __v: 0 };
const getUsers = async (req, res) => {
  try {
    const usersData = await User.find({}, excludedFields).sort({
      created_at: 'desc',
    });

    return res.status(200).json(usersData);
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { userName, firstName, lastName, password } = req.body;

    const isUserNameExist = await User.findOne({
      userName: userName.trim(),
    });

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
      userName: userName.trim(), // userName should be trimmed so that it can be unique and removes whitespaces.
      firstName: firstName,
      lastName: lastName,
      password: hashedSaltedPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Something went wrong!',
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
    console.log(error);
    res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { getUsers, registerUser, viewUser };
