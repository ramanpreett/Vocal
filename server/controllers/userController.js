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

export const updateProfile = async (req, res) => {
  try {
    const { bio, location, institution, experience, skills } = req.body;
    
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (institution !== undefined) user.institution = institution;
    if (experience !== undefined) user.experience = experience;
    
    if (skills !== undefined) {
      const skillsArray = typeof skills === 'string' 
        ? skills.split(',').map(s => s.trim()).filter(s => s !== '')
        : skills;
      user.skills = skillsArray;
    }

    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
    }

    await targetUser.save();
    await currentUser.save();

    res.json({ 
      isFollowing: !isFollowing, 
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

