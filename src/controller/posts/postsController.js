import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Post from '../../models/posts/postModel.js';
import User from '../../models/users/userModel.js';
import { validationErrorMessageMapper } from '../../utils/string.js';

const addPost = async (req, res) => {
  const user_id = req.user_id;
  const { title, message } = req.body;

  try {
    const author = await User.findOne({ user_id }).select(
      '-password',
    );

    if (!author) {
      return res.status(400).json({
        message: 'No Author Found',
      });
    }

    const newPost = new Post({
      author,
      title,
      message,
    });

    await newPost.save();

    return res.status(201).json({
      message: 'Added post successfully',
      data: newPost,
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

const getPosts = async (req, res) => {
  try {
    const { search, limit = 5, offset = 0 } = req.query;

    const regexPattern = new RegExp(search, 'i');

    const query = search
      ? {
          $or: [
            { title: { $regex: regexPattern } },
            { message: { $regex: regexPattern } },
          ],
        }
      : {};

    const _limit = parseInt(limit);
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
                offset: parseInt(offset),
              },
            },
          ],
          data: [
            { $skip: offset * _limit },
            { $sort: { created_at: -1 } },
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
      meta: meta[0] || {},
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

export { addPost, getPosts };

// {
//   $facet: {
//     metadata: [
//       { $count: 'total_rows' },
//       {
//         $addFields: {
//           total_pages: {
//             $ceil: { $divide: ['$total_rows', limit] },
//           },
//           limit: limit,
//           offset: offset,
//         },
//       },
//     ],
//     data: [
//       { $sort: { created_at: -1 } },
//       { $skip: offset * limit },
//       { $limit: limit },

//       {
//         $lookup: {
//           from: 'users',
//           localField: 'author', // Field from the User collection
//           foreignField: '_id',
//           as: 'author_info',
//         },
//       },
//       {
//         $project: {
//           author: 0,
//           'author_info.password': 0,
//         },
//       },
//     ],
//   },
// },
