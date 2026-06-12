import Meeting from '../models/Meeting.js';

export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ isPublic: true }, { host: req.user._id }, { attendees: req.user._id }]
    }).populate('host', 'fullName username').sort('date');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const scheduleMeeting = async (req, res) => {
  try {
    const { title, description, date, time, isPublic, attendees, meetingLink } = req.body;
    
    const meeting = await Meeting.create({
      host: req.user._id,
      title,
      description,
      date,
      time,
      isPublic: isPublic !== undefined ? isPublic : true,
      attendees: attendees || [],
      meetingLink: meetingLink || ''
    });
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Only the host can cancel
    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this meeting' });
    }

    await meeting.deleteOne();
    res.json({ message: 'Meeting cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
