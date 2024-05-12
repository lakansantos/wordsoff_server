import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followed_user_id: {
      type: String,
      required: true,
    },
    followed_user_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'date_followed',
      updatedAt: false,
    },
  },
);

const Follower =
  mongoose.models.Follower ||
  mongoose.model('Follower', followerSchema);

export default Follower;
