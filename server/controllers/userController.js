import User from '../models/User.js';
import Post from '../models/Post.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const posts = await Post.find({ uploadedBy: user._id })
      .populate('uploadedBy', 'username fullName profilePhoto')
      .populate('comments.user', 'username profilePhoto')
      .sort('-createdAt');
    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllEducators = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const isAvailable = !user;
    res.json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePhoto = req.file.path; // Cloudinary URL
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
