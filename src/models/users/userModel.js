import mongoose from 'mongoose';
import { UUID } from 'mongodb';

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    followers_count: {
      type: Number,
      default: 0,
    },
    following_count: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: String,
      default: () => new UUID(),
    },
    last_logged_in: {
      type: Date,
    },
    about: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

userSchema.virtual('');

userSchema.index({ user_name: 'text' });
const User =
  mongoose.models.User || mongoose.model('User', userSchema);

export default User;
