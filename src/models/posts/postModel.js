import { UUID } from 'mongodb';
import mongoose from 'mongoose';

const postModel = new mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    match: 'user_id',
  },
  post_id: {
    type: String,
    default: () => new UUID(),
  },
  title: {
    type: String,
    required: true,
  },
  post_content: {
    type: String,
    required: true,
  },
  post_image_url: {
    type: String,
    required: false,
  },
});

const Post = mongoose.model.Post || mongoose.model('Post', postModel);

export default Post;
