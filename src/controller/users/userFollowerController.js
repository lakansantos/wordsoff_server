import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Follower from '../../models/users/userFollowerModel.js';
import User from '../../models/users/userModel.js';

const followUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    const user_id = req.user_id;

    const loggedInUser = await User.findOne({
      user_id,
    });

    const targetUser = await User.findOne({
      user_id: targetUserId,
    });

    if (!targetUser) {
      return res.status(400).json({
        message: 'User is not available',
      });
    }

    const isFollowedUser = await Follower.findOne({
      follower: loggedInUser._id,
      followed_user_id: targetUserId,
    });

    if (isFollowedUser) {
      return res.status(400).json({
        message: 'You already followed this user',
      });
    }

    if (targetUserId === user_id) {
      return res.status(400).json({
        message: 'You cannot follow yourself!',
      });
    }

    const newFollower = new Follower({
      follower: loggedInUser._id,
      followed_user_id: targetUserId,
    });

    await newFollower.save();

    return res.status(200).json({
      message: 'Followed user successfully',
      newFollower,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    const user = await User.findOne({ user_id: targetUserId }).select(
      { password: 0 },
    );

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    const targetUser = await Follower.find({
      followed_user_id: user.user_id,
    }).populate({
      path: 'follower',
      select: { password: 0 },
    });

    return res.status(200).json({
      data: targetUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

export { followUser, getUserFollowers };
