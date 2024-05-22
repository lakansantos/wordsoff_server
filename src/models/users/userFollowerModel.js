import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema(
  {
    follower_details: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followed_user_details: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followed_user_name: {
      type: String,
    },
    follower_user_name: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'date_followed',
      updatedAt: false,
    },
  },
);

followerSchema.index({
  follower_name: 'text',
  followed_user_name: 'text',
});

const Follower =
  mongoose.models.Follower ||
  mongoose.model('Follower', followerSchema);

export default Follower;
