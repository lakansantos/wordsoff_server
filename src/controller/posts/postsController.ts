import { SERVER_ERROR_MESSAGE } from '@configs/constant';
import Post from '@models/posts/postModel';

import User from '@models/users/userModel';
import { validationErrorMessageMapper } from '@utils/string';

import { Request, Response } from 'express';

const addPost = async (req: Request, res: Response) => {
  const token_id = req.token_id;
  const { title, message, genre, image } = req.body;

  try {
    const author = await User.findById({ _id: token_id });

    if (!author) {
      return res.status(400).json({
        message: 'No Author Found',
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

    const newPost = new Post({
      author,
      title,
      message,
      genre,
      image_file,
    });

    await newPost.save();

    const postsCount = await Post.countDocuments({
      author: author._id,
    });

    await User.findOneAndUpdate(
      { _id: author._id },
      {
        posts_count: postsCount,
      },
    );

    return res.status(201).json({
      message: 'Added post successfully',
      data: newPost,
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

const getPosts = async (req: Request, res: Response) => {
  try {
    const { search, limit = 5, offset = 0 } = req.query;

    const regexPattern = new RegExp(search as string, 'i');

    const query = search
      ? {
          $or: [
            { title: { $regex: regexPattern } },
            { message: { $regex: regexPattern } },
          ],
        }
      : {};

    const _limit = parseInt(limit as string);
    const _offset = parseInt(offset as string);
    const response = await Post.aggregate([
      { $match: query },
      {
        $facet: {
          meta: [
            { $count: 'total_rows' },
            {
              $addFields: {
                total_pages: {
                  $ceil: {
                    $divide: ['$total_rows', _limit],
                  },
                },
                limit: _limit,
                offset: _offset,
              },
            },
          ],
          data: [
            { $sort: { created_at: -1 } },
            { $skip: _offset * _limit },
            { $limit: _limit },

            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author_info',
              },
            },
            {
              $project: {
                'author_info.password': 0,
                'author_info._id': 0,
                'author_info.created_at': 0,
                'author_info.updated_at': 0,
                'author_info.__v': 0,
                'author_info.last_logged_in': 0,
                author: 0,
                _id: 0,
                __v: 0,
              },
            },
          ],
        },
      },
    ]);

    const [{ meta, data = [] }] = response;
    return res.status(200).json({
      data,
      meta: meta[0] || {
        limit: limit,
        offset: _offset,
        total_pages: 0,
        total_rows: 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: {
        SERVER_ERROR_MESSAGE,
      },
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({
      post_id: postId,
    }).populate('author');

    if (!post) {
      return res.status(404).json({
        message: 'Post is not available!',
      });
    }

    return res.status(200).json({
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

export { addPost, getPosts, getPostById };
