import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Post from '../../models/posts/postModel.js';
import User from '../../models/users/userModel.js';

const excludedFields = { password: 0, __v: 0 };

const getUserPost = async (req, res) => {
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

    const userPost = await Post.find({ author: user._id }).populate({
      path: 'author',
      select: { password: 0 },
    });
    if (!userPost) {
      return res.status(400).json({
        message: "User's posts not found",
      });
    }

    return res.status(200).json({
      data: userPost,
    });
  } catch (error) {
    res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { getUserPost };
