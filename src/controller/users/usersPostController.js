import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Post from '../../models/posts/postModel.js';
import User from '../../models/users/userModel.js';
import { validationErrorMessageMapper } from '../../utils/string.js';
import { deleteImage, uploadImage } from '../../utils/uploads.js';

const getUserPost = async (req, res) => {
  const { userName } = req.params;

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

    const user = await User.findOne({ user_name: userName });

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

const editUserPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const { genre, title, message, uploaded_image_path } = req.body;
    const token_id = req.token_id;

    const author = await User.findOne({
      _id: token_id,
    });

    if (!author) {
      return res.status(400).json({
        message: 'Not authorized',
      });
    }

    let image_file = null;

    if (uploaded_image_path) {
      const { url, public_id } = await uploadImage(
        uploaded_image_path,
      );
      image_file = {
        path: url,
        public_id,
      };
    }
    const postToEdit = await Post.findOne({
      post_id: postId,
      author: author._id,
    });

    // delete the image in the cloudinary whenever the user edited the photo
    if (
      (uploaded_image_path === null || uploaded_image_path) &&
      postToEdit.image_file.public_id
    ) {
      await deleteImage(postToEdit.image_file.public_id);
    }

    if (!postToEdit) {
      return res.status(404).json({
        message: 'Selected post is not available.',
      });
    }

    // Update the post with new details
    postToEdit.title = title;
    postToEdit.message = message;
    postToEdit.genre = genre;
    postToEdit.image_file = image_file;

    // Save the updated post
    await postToEdit.save();

    return res.status(201).json({
      message: postToEdit,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: validationErrorMessageMapper(error),
      });
    }

    // for image file upload error handling
    if (error.message === 'ENOENT') {
      return res.status(500).json({
        message: 'Selected file path do not exist',
      });
    }
    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { getUserPost, deletePostPermanently, editUserPost };
