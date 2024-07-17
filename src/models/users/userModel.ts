import mongoose from 'mongoose';
import { UUID } from 'mongodb';

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: [true, 'User name is required'],
    },
    email: {
      type: String,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    birth_date: {
      type: Date,
      required: true,
    },
    profile_image: {
      path: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    cover_photo_image: {
      path: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    followers_count: {
      type: Number,
      default: 0,
    },
    posts_count: {
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
    isOTPEnabled: {
      type: Boolean,
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
