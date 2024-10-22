import { Request, Response } from 'express';

import { SERVER_ERROR_MESSAGE } from '@configs/constant';
import User from '@models/users/userModel';
import bcrypt from 'bcryptjs';
import { validationErrorMessageMapper } from '@utils/string';
import { deleteImage } from '@utils/uploadImage';
import checkFieldsValidator from '@utils/checkFieldsValidator';

const excludedFields = { password: 0, _id: 0, __v: 0 };

const getUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 5, offset = 0, search } = req.query;

    const regexSearch = new RegExp(search as string, 'i');
    const query = search
      ? { user_name: { $regex: regexSearch } }
      : {};

    const _limit = parseInt(limit as string);
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
                offset: parseInt(offset as string),
              },
            },
          ],
          data: [
            {
              $lookup: {
                from: 'posts',
                foreignField: 'author',
                localField: '_id',
                as: 'posts',
              },
            },
            {
              $addFields: {
                posts_count: { $size: '$posts' },
                last_logged_in: {
                  $ifNull: ['$last_logged_in', null],
                },
              },
            },
            {
              $sort: { created_at: -1 },
            },
            { $skip: parseInt(offset as string) * _limit },
            { $limit: _limit },
            {
              $project: {
                password: 0,
                _id: 0,
                __v: 0,
                posts: 0,
              },
            },
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

const registerUser = async (req: Request, res: Response) => {
  try {
    const { user_name, gender, about, birth_date, password } =
      req.body;

    const regexUserNameFormat = /^[a-zA-Z0-9_]+$/;
    const trimmedUserName = user_name ? user_name.trim() : undefined;

    if (trimmedUserName.length < 3) {
      return res.status(400).json({
        message:
          'User name character length must be at least 3 characters long',
      });
    }
    const isValidFormat = regexUserNameFormat.test(trimmedUserName);

    if (!isValidFormat)
      return res.status(400).json({
        message:
          'Invalid username Format. Should contain only 1 word and no special characters.',
      });
    const isUserNameExist = await User.findOne({
      user_name: trimmedUserName,
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

    const epochBirthDate = Date.parse(birth_date);

    if (epochBirthDate > Date.now()) {
      return res.status(400).json({
        message: 'Birth date must be in the past.',
      });
    }

    const newUser = new User({
      user_name: trimmedUserName, // user_name should be trimmed so that it can be unique and removes whitespaces.
      gender: gender,
      password: hashedSaltedPassword,
      about: about,
      birth_date: birth_date,
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        user_name: newUser.user_name,
        gender: newUser.gender,
        user_id: newUser.user_id,
        about: newUser.about,
        birth_date: newUser.birth_date,
        profile_image: newUser.profile_image,
        cover_photo_image: newUser.cover_photo_image,
      },
    });
  } catch (error) {
    const validationError = error as Fetch.Errors;
    if (validationError.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error as Fetch.Error),
      });
    }
    // for image file upload error handling
    if (validationError.message === 'ENOENT') {
      return res.status(500).json({
        message: 'Selected file path do not exist',
      });
    }
    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const viewUser = async (req: Request, res: Response) => {
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

const uploadProfileImage = async (req: Request, res: Response) => {
  const token_id = req.token_id;

  try {
    const { image } = req.body;

    const thisUser = await User.findById(token_id);

    if (!thisUser) {
      return res.status(400).json({
        message: "Selected user's profile is not available.",
      });
    }

    let image_file = null;
    if (image) {
      if (image.public_id && image.path) {
        image_file = {
          path: image.path,
          public_id: image.public_id,
        };
      } else {
        return res.status(400).json({
          message: 'Both public_id and path are required.',
        });
      }
    }

    // delete the image in the cloudinary whenever the user re-uploaded a photo
    if (thisUser.profile_image.public_id) {
      await deleteImage(thisUser.profile_image.public_id);
    }

    thisUser.profile_image = image_file;

    await thisUser.save();

    return res.status(201).json({
      data: thisUser,
    });
  } catch (error) {
    const validationError = error as Fetch.Errors;
    // for image file upload error handling
    if (validationError.message === 'ENOENT') {
      return res.status(500).json({
        message: 'Selected file path do not exist',
      });
    }

    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const uploadCoverPhotoImage = async (req: Request, res: Response) => {
  const token_id = req.token_id;

  try {
    const { image } = req.body;

    const thisUser = await User.findById(token_id);

    if (!thisUser) {
      return res.status(400).json({
        message: "Selected user's profile is not available.",
      });
    }

    let cover_photo_image = null;
    if (image) {
      if (image.public_id && image.path) {
        cover_photo_image = {
          path: image.path,
          public_id: image.public_id,
        };
      } else {
        return res.status(400).json({
          message: 'Both public_id and path are required.',
        });
      }
    }

    // delete the image in the cloudinary whenever the user re-uploaded a photo
    if (thisUser.cover_photo_image.public_id) {
      await deleteImage(thisUser.cover_photo_image.public_id);
    }

    thisUser.cover_photo_image = cover_photo_image;

    await thisUser.save();

    return res.status(201).json({
      data: thisUser,
    });
  } catch (error) {
    const validationError = error as Fetch.Errors;
    // for image file upload error handling
    if (validationError.message === 'ENOENT') {
      return res.status(500).json({
        message: 'Selected file path do not exist',
      });
    }

    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const editUserDetails = async (req: Request, res: Response) => {
  const token_id = req.token_id;
  try {
    const { gender, birth_date, about } = req.body;

    const requiredFields = { gender, birth_date };

    const fieldsKey = Object.keys(requiredFields);

    const { hasMissingFields, errorMessage } = checkFieldsValidator(
      fieldsKey,
      req,
    );

    if (hasMissingFields) {
      return res.status(400).json({
        message: errorMessage,
      });
    }
    const selectedUser = await User.findByIdAndUpdate(
      {
        _id: token_id,
      },
      {
        gender,
        birth_date,
        about,
      },
      { new: true, runValidators: true },
    );

    if (!selectedUser) {
      return res.status(400).json({
        message: 'User is not available',
      });
    }

    return res.status(200).json({
      data: selectedUser,
    });
  } catch (error) {
    console.log(error);

    const validationError = error as Fetch.Errors;
    if (validationError.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error as Fetch.Error),
      });
    }

    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export {
  getUsers,
  registerUser,
  viewUser,
  editUserDetails,
  uploadProfileImage,
  uploadCoverPhotoImage,
};
