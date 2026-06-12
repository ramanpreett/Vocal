import Meeting from '../models/Meeting.js';

export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { attendees: req.user._id }]
    }).populate('host', 'fullName username').sort('date');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const scheduleMeeting = async (req, res) => {
  try {
    const { title, description, date, time } = req.body;
    const meeting = await Meeting.create({
      host: req.user._id,
      title,
      description,
      date,
      time,
      attendees: [req.user._id]
    });
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
