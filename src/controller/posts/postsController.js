import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Post from '../../models/posts/postModel.js';
import User from '../../models/users/userModel.js';

const addPost = async (req, res) => {
  const user_id = req.user_id;
  const { title, message } = req.body;

  try {
    const user = await User.findOne({ user_id });

    const newPost = new Post({
      user_id,
      user_name: user.user_name,
      title,
      message,
    });

    await newPost.save();

    return res.status(201).json({
      message: 'Added post successfully',
      data: newPost,
    });
  } catch (error) {
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

    const query = search ? { title: { $regex: regexPattern } } : {};
    const totalRows = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalRows / limit);
    const posts = await Post.find(query, { _id: 0 })
      .skip(skipIndex)
      .limit(parseInt(limit))
      .sort({
        created_at: 'desc',
      });

    return res.status(200).json({
      data: posts,
      meta: {
        totalRows,
        limit,
        totalPages,
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
