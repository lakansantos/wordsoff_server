import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Follower from '../../models/users/userFollowerModel.js';
import User from '../../models/users/userModel.js';

const followUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    const loggedInUserTokenId = req.token_id;

    // get the logged in user id
    const loggedInUser = await User.findById({
      _id: loggedInUserTokenId,
    });

    // get the target user to follow
    const targetUser = await User.findOne({
      user_id: targetUserId,
    });

    if (!targetUser) {
      return res.status(400).json({
        message: 'User is not available',
      });
    }

    // check also if the logged in user followed the other user already
    const isFollowedUser = await Follower.exists({
      follower: loggedInUser._id,
      followed_user: targetUser._id,
    });

    if (isFollowedUser) {
      return res.status(400).json({
        message: 'You already followed this user',
      });
    }

    if (targetUserId === loggedInUser.user_id) {
      return res.status(400).json({
        message: 'You cannot follow yourself!',
      });
    }

    const newFollower = new Follower({
      follower: loggedInUser._id,
      followed_user: targetUser._id,
    });

    await newFollower.save();

    // this is used to get the total followers count of the followed user then append it to their data.
    const followerCount = await Follower.countDocuments({
      followed_user: targetUser._id,
    });

    await User.findOneAndUpdate(
      { user_id: targetUserId },
      {
        followers_count: followerCount,
      },
    );

    // this is used to get the total following count of the logged in user then append it to their data.
    const followingCount = await Follower.countDocuments({
      follower: loggedInUserTokenId,
    });

    await User.findByIdAndUpdate(loggedInUser, {
      following_count: followingCount,
    });

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

    const user = await User.findOne({ user_id: targetUserId });

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    const targetUser = await Follower.find({
      followed_user: user._id,
    })
      .populate({
        path: 'follower',
      })
      .sort({
        date_followed: 'desc',
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

const getUserFollowing = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    // just to get the ._id
    const user = await User.findOne({
      user_id: targetUserId,
    });

    const usersFollowing = await Follower.find(
      {
        follower: user._id,
      },
      { follower: 0 },
    ).populate({
      path: 'followed_user',
    });

    return res.status(200).json({
      data: usersFollowing,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export { followUser, getUserFollowers, getUserFollowing };
