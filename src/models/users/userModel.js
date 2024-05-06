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
    comments: {
      type: Array,
      required: false,
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
      currentTime: () => Math.floor(Date.now() / 1000),
    },
  },
);

userSchema.virtual('');

userSchema.set('toJSON', {
  transform: function (_, ret) {
    ret.created_at = ret.created_at.getTime();
    ret.updated_at = ret.updated_at.getTime();
  },
});
const User =
  mongoose.models.User || mongoose.model('User', userSchema);
export default User;
