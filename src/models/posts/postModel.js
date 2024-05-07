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
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    message_image_url: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      currentTime: () => Math.floor(Date.now() / 1000),
    },
  },
);

postSchema.virtual('');

postSchema.set('toJSON', {
  transform: function (_, ret) {
    ret.created_at = ret.created_at.getTime();
    ret.updated_at = ret.updated_at.getTime();
  },
});

const Post =
  mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
