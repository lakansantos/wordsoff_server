import { SERVER_ERROR_MESSAGE } from '../../config/constant.js';
import Follower from '../../models/users/userFollowerModel.js';
import User from '../../models/users/userModel.js';

const followUser = async (req, res) => {
  try {
    const { targetUserName } = req.params;

    const loggedInUserTokenId = req.token_id;

    // get the logged in user id
    const loggedInUser = await User.findById({
      _id: loggedInUserTokenId,
    });

    // get the target user to follow
    const targetUser = await User.findOne({
      user_name: targetUserName,
    });

    if (!targetUser) {
      return res.status(400).json({
        message: 'User is not available',
      });
    }

    // check also if the logged in user followed the other user already
    const isFollowedUser = await Follower.exists({
      follower_details: loggedInUser._id,
      followed_user_details: targetUser._id,
    });

    if (isFollowedUser) {
      return res.status(400).json({
        message: 'You already followed this user',
      });
    }

    if (targetUserName === loggedInUser.user_name) {
      return res.status(400).json({
        message: 'You cannot follow yourself!',
      });
    }

    const newFollower = new Follower({
      follower_details: loggedInUser._id,
      followed_user_details: targetUser._id,
      follower_user_name: loggedInUser.user_name,
      followed_user_name: targetUser.user_name,
    });

    await newFollower.save();

    // this is used to get the total followers count of the followed user then append it to their data.
    const followerCount = await Follower.countDocuments({
      followed_user_details: targetUser._id,
    });

    await User.findOneAndUpdate(
      { user_name: targetUserName },
      {
        followers_count: followerCount,
      },
    );

    // this is used to get the total following count of the logged in user then append it to their data.
    const followingCount = await Follower.countDocuments({
      follower_details: loggedInUserTokenId,
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

const unfollowUser = async (req, res) => {
  const token_id = req.token_id;

  try {
    const { targetUserName } = req.params;
    const thisUser = await User.findById(token_id);
    const userToUnfollow = await User.findOne({
      user_name: targetUserName,
    });

    console.log(token_id);
    if (!thisUser) {
      return res.status(400).json({
        message:
          'You are currently not available to perform this action. Please try again later.',
      });
    }
    // check also if the logged in user followed the other user already
    const isFollowedUser = await Follower.exists({
      follower_details: thisUser._id,
      followed_user_details: userToUnfollow._id,
    });

    if (!isFollowedUser) {
      return res.status(400).json({
        message:
          "You cannot unfollow someone you haven't followed yet.",
      });
    }

    await Follower.findOneAndDelete({
      followed_user_details: userToUnfollow._id,
      follower_details: thisUser._id,
    });

    // this is used to get the total following count of the logged in user then append it to their data.
    const followingCount = await Follower.countDocuments({
      follower_details: thisUser._id,
    });

    // this is used to get the total followers count of the followed user then append it to their data.
    const followerCount = await Follower.countDocuments({
      followed_user_details: userToUnfollow._id,
    });

    await User.findByIdAndUpdate(thisUser, {
      following_count: followingCount,
    });

    await User.findByIdAndUpdate(userToUnfollow, {
      followers_count: followerCount,
    });

    return res.status(200).json({
      message: 'Unfollowed successfully',
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: SERVER_ERROR_MESSAGE,
    });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const { targetUserName } = req.params;

    const user = await User.findOne({ user_name: targetUserName });

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    const { search, limit = 5, offset = 0 } = req.query;

    const regexSearch = new RegExp(search, 'i');

    const query = search
      ? { follower_user_name: { $regex: regexSearch } }
      : {};

    const _limit = parseInt(limit);

    const [{ meta = {}, data = [] }] = await Follower.aggregate([
      {
        $match: {
          ...query,
          followed_user_details: user._id,
        },
      },
      {
        $facet: {
          meta: [
            { $count: 'total_rows' },
            {
              $addFields: {
                total_pages: {
                  $ceil: {
                    $divide: ['$total_rows', _limit],
                  },
                },
                limit: _limit,
                offset: offset,
              },
            },
          ],
          data: [
            { $skip: _limit * offset },
            { $sort: { date_followed: -1 } },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'follower_details',
                foreignField: '_id',
                as: 'follower_details',
              },
            },
            {
              $project: {
                'follower_details.password': 0,
                _id: 0,
                __v: 0,
              },
            },
            {
              $unwind: '$follower_details',
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      data,
      meta: meta[0] || {
        limit: limit,
        offset: offset,
        total_pages: 0,
        total_rows: 0,
      },
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
    const { targetUserName } = req.params;

    // just to get the ._id
    const user = await User.findOne({
      user_name: targetUserName,
    });

    const { search, offset = 0, limit = 5 } = req.query;

    const _limit = parseInt(limit);

    const regexSearch = new RegExp(search, 'i');
    const query = search
      ? {
          followed_user_name: { $regex: regexSearch },
        }
      : {};

    const [{ data = [], meta }] = await Follower.aggregate([
      {
        $match: {
          ...query,
          follower_details: user._id,
        },
      },
      {
        $facet: {
          meta: [
            { $count: 'total_rows' },
            {
              $addFields: {
                limit: _limit,
                offset: parseInt(offset),
                total_pages: {
                  $ceil: {
                    $divide: ['$total_rows', _limit],
                  },
                },
              },
            },
          ],
          data: [
            { $skip: parseInt(offset) * _limit },
            { $sort: { date_followed: -1 } },
            { $limit: _limit },
            {
              $lookup: {
                from: 'users',
                localField: 'followed_user_details',
                foreignField: '_id',
                as: 'followed_user_details',
              },
            },
            {
              $project: {
                'followed_user_details.password': 0,
                'followed_user_details.updated_at': 0,
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      data,
      meta: meta[0] || {
        limit: limit,
        offset: offset,
        total_pages: 0,
        total_rows: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export {
  followUser,
  getUserFollowers,
  getUserFollowing,
  unfollowUser,
};
