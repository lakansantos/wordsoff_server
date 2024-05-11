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

    // const userPost = await Post.find({ author: user._id })
    //   .sort({ created_at: 'desc' })
    //   .populate({
    //     path: 'author',
    //     select: { password: 0 },
    //   });
    // if (!userPost) {
    //   return res.status(400).json({
    //     message: "User's posts not found",
    //   });
    // }

    return res.status(200).json({
      data,
      meta,
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
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deletePostPermanently = async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const userIdFromParams = userId;
    const userIdLoggedIn = req.user_id;

    const loggedInUser = await User.findOne({
      user_id: userIdLoggedIn,
    }).select({ password: 0 });

    if (userIdFromParams !== loggedInUser.user_id) {
      return res.status(401).json({
        message: 'Unauthorized to delete a post',
      });
    }

    const selectedDeletePost = await Post.findOneAndDelete({
      post_id: postId,
      author: loggedInUser._id,
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
