import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Post from '../../models/posts/postModel.js';
import User from '../../models/users/userModel.js';

const getUserPost = async (req, res) => {
  const { userId } = req.params;

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

    const user = await User.findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const _limit = parseInt(limit);

    const [{ data = [], meta = {} }] = await Post.aggregate([
      { $match: { ...query, author: user._id } },
      {
        $facet: {
          meta: [
            { $count: 'total_rows' },
            {
              $addFields: {
                limit: _limit,
                offset: parseInt(offset),
                total_pages: {
                  $ceil: {
                    $divide: ['$total_rows', _limit],
                  },
                },
              },
            },
          ],
          data: [
            { $sort: { created_at: -1 } },
            { $skip: offset * limit },
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
                author: 0,
                _id: 0,
                __v: 0,
              },
            },
          ],
        },
      },
    ]);

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
    res.status(500).json({
      message: { SERVER_ERROR_MESSAGE, error },
    });
  }
};

/**
 * Requirements for this one
 * Logged in user should not be able to delete other users' post
 * Logged in user can only delete their own post
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deletePostPermanently = async (req, res) => {
  try {
    const { postId } = req.params;
    const userLoggedInTokenId = req.token_id;

    const selectedDeletePost = await Post.findOneAndDelete({
      post_id: postId,
      author: userLoggedInTokenId,
    });

    if (!selectedDeletePost) {
      return res.status(400).json({
        message: 'Selected post is not available',
      });
    }

    return res.status(200).json({
      message: 'Deleted the post successfully',
      deletedPost: selectedDeletePost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { getUserPost, deletePostPermanently };
