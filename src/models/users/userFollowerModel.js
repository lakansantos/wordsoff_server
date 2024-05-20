import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followed_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: {
      createdAt: 'date_followed',
      updatedAt: false,
    },
  },
);

followerSchema.index({ follower_name: 'text' });

const Follower =
  mongoose.models.Follower ||
  mongoose.model('Follower', followerSchema);

export default Follower;
