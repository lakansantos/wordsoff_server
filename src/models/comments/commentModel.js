import { UUID } from 'mongodb';
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  comment_text: String,
  // Reference the user who made the comment
  user_id: {
    type: String,
    ref: 'User',
    match: 'user_id',
  },
  // Reference the post the comment belongs to
  post_id: {
    type: String,
    ref: 'Post',
    match: 'post_id',
  },
  comment_id: {
    type: String,
    default: () => new UUID(),
  },
});

const Comment =
  mongoose.model.Comment || mongoose.model('Comment', commentSchema);

export default Comment;
