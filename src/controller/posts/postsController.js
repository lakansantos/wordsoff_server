import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Post from '../../models/posts/postModel.js';

const addPost = async (req, res) => {
  const user_id = req.user_id;
  const { title, message } = req.body;

  try {
    const newPost = await new Post({
      user_id,
      title,
      message,
    });

    newPost.save();

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

export { addPost };
