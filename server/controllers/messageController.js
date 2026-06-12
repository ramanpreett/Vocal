import Message from '../models/Message.js';

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate({
      path: 'sharedPost',
      populate: { path: 'uploadedBy', select: 'username fullName profilePhoto' }
    })
    .sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params; // receiver
    const { message, sharedPost } = req.body;
    const currentUserId = req.user._id; // sender

    const newMessage = await Message.create({
      sender: currentUserId,
      receiver: userId,
      message: message || '',
      sharedPost: sharedPost || undefined
    });

    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: 'sharedPost',
      populate: { path: 'uploadedBy', select: 'username fullName profilePhoto' }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
