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

    const skipIndex = offset * limit;

    const query = search
      ? {
          $or: [
            { title: { $regex: regexPattern } },
            { message: { $regex: regexPattern } },
          ],
        }
      : {};
    const total_rows = await Post.countDocuments(query);

    const total_pages = Math.ceil(total_rows / limit);
    const posts = await Post.find(query, { _id: 0 })
      .skip(skipIndex)
      .limit(parseInt(limit))
      .populate({ path: 'author', select: { password: 0 } })
      .sort({
        created_at: 'desc',
      });

    return res.status(200).json({
      data: posts,
      meta: {
        total_rows,
        limit,
        total_pages,
        offset,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { addPost, getPosts };
