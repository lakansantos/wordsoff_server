import mongoose from 'mongoose';

const imageSchema = mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
});

const Image =
  mongoose.models.Image || mongoose.model('Image', imageSchema);

export default Image;
