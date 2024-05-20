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

    const { search, limit = 5, offset = 0 } = req.query;

    const regexSearch = new RegExp(search, 'i');

    const query = search
      ? { follower_name: { $regex: regexSearch } }
      : {};

    const _limit = parseInt(limit);

    const _offset = parseInt(offset);

    const [{ meta = {}, data = [] }] = await Follower.aggregate([
      {
        $match: {
          followed_user: user._id,
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
                offset: _offset,
              },
            },
          ],
          data: [
            { $skip: _limit * _offset },
            { $sort: { created_at: -1 } },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'follower',
                foreignField: '_id',
                as: 'follower',
              },
            },
            {
              $addFields: {
                follower_name: '$follower.user_name',
              },
            },
            { $unwind: '$follower_name' },
            {
              $match: {
                ...query,
              },
            },
            { $project: { 'follower.password': 0, _id: 0, __v: 0 } },
            {
              $unwind: '$follower',
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      data,
      meta,
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
