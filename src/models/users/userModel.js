import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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
    ret.user_id = ret._id;
    ret.created_at = ret.created_at.getTime();
    ret.updated_at = ret.updated_at.getTime();
    delete ret._id;
    delete ret._v;
  },
});
const User =
  mongoose.models.User || mongoose.model('User', userSchema);
export default User;
