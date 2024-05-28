import { UUID } from 'mongodb';
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    post_id: {
      type: String,
      default: () => new UUID(),
    },
    genre: [String],
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    image_file: {
      path: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

postSchema.index({ message: 'text', title: 'text' });
const Post =
  mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
