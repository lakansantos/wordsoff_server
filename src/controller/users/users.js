import User from '../../models/users/userModel.js';

const getUsers = async (req, res) => {
  try {
    const usersData = await User.find().sort({ createdAt: 'desc' });
    return res.status(200).json(usersData);
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
    });
  }
};

export { getUsers };
