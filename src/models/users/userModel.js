import mongoose from 'mongoose';
import { UUID } from 'mongodb';

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      default: () => new UUID(),
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
