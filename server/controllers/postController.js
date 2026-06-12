import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { mediaType, caption, skill } = req.body;
    let mediaUrl = req.body.mediaUrl;
    let thumbnailUrl = null;

    let mediaUrls = [];

    if (req.files && req.files.carouselFiles) {
      mediaUrls = req.files.carouselFiles.map(file => file.path);
    } else if (req.files && req.files.file) {
      mediaUrl = req.files.file[0].path; // Cloudinary URL
    }

    if (req.files && req.files.thumbnail) {
      thumbnailUrl = req.files.thumbnail[0].path;
    }

    const post = await Post.create({
      uploadedBy: req.user._id,
      mediaType,
      mediaUrl,
      mediaUrls,
      thumbnailUrl,
      caption,
      skill
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { filter } = req.query;
    let query = {};
    
    if (filter === 'my-skills') {
      const user = await User.findById(req.user._id);
      if (user && user.skills && user.skills.length > 0) {
        query = { skill: { $in: user.skills } };
      } else {
        query = { skill: { $in: [] } }; // return empty if no skills selected
      }
    }

    const posts = await Post.find(query)
      .populate('uploadedBy', 'fullName username profilePhoto')
      .populate('comments.user', 'fullName username profilePhoto')
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user._id,
      text
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(post._id).populate('comments.user', 'fullName username profilePhoto');
    res.json(populatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const topContributors = await Post.aggregate([
      { $group: { _id: '$uploadedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 1, count: 1, 'user.fullName': 1, 'user.username': 1, 'user.profilePhoto': 1 } }
    ]);

    const trendingSkills = await Post.aggregate([
      { $match: { skill: { $nin: ['General', null, ''] } } },
      { $group: { _id: '$skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ topContributors, trendingSkills });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check authorization
    if (post.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
