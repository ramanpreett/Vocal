import React, { useState, useEffect, useContext } from 'react';
import { FiCalendar, FiClock, FiVideo, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Meetings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [meetings, setMeetings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '', date: '', time: '', meetingLink: '', isPublic: true, attendees: [] });
  const [educators, setEducators] = useState([]);

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/api/meetings');
      setMeetings(res.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchEducators = async () => {
    try {
      const res = await api.get('/api/users');
      setEducators(res.data);
    } catch (error) {
      console.error('Error fetching educators:', error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchEducators();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/meetings', newMeeting);
      setIsModalOpen(false);
      setNewMeeting({ title: '', description: '', date: '', time: '', meetingLink: '', isPublic: true, attendees: [] });
      fetchMeetings();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/api/meetings/${id}`);
      fetchMeetings();
      toast.success('Meeting cancelled successfully');
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast.error('Failed to cancel meeting');
    }
  };

  // Determine if a meeting is past or upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  });
  
  const pastMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.date);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate < today;
  });

  const filteredMeetings = activeTab === 'Upcoming' ? upcomingMeetings : pastMeetings;

  return (
    <div className="max-w-4xl mx-auto pt-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Meetings</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#8B5CF6] text-gray-900 font-semibold rounded-xl hover:bg-[#7C3AED] shadow-sm transition"
        >
          <FiPlus /> Schedule Meeting
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        {['Upcoming', 'Past'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === tab 
                ? 'bg-[#001011] text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredMeetings.map(meeting => (
          <div key={meeting._id} className="glass p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition">
            <div className="flex-1 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <FiCalendar className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  {meeting.title}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meeting.isPublic ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {meeting.isPublic ? 'Public' : 'Private'}
                  </span>
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><FiCalendar /> {new Date(meeting.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><FiClock /> {meeting.time}</span>
                  <span>Hosted by {meeting.host?.fullName || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
              {activeTab === 'Upcoming' && (
                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 border-2 border-[#8B5CF6] text-[#8B5CF6] font-semibold rounded-xl hover:bg-[#8B5CF6] hover:text-white transition">
                  <FiVideo /> Join Meeting
                </a>
              )}
              {meeting.host?._id === user?._id && activeTab === 'Upcoming' && (
                <button onClick={() => setShowCancelConfirm(meeting._id)} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 border-2 border-red-500 text-red-500 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition">
                  Cancel Meeting
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredMeetings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No {activeTab.toLowerCase()} meetings found.
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
              <FiX className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Schedule Meeting</h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <input required type="text" value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Link</label>
                <input required type="url" placeholder="https://meet.google.com/..." value={newMeeting.meetingLink} onChange={e => setNewMeeting({...newMeeting, meetingLink: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input required type="date" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input required type="time" value={newMeeting.time} onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newMeeting.isPublic} onChange={e => setNewMeeting({...newMeeting, isPublic: e.target.checked, attendees: []})} className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6] w-4 h-4" />
                  <span className="text-sm font-medium">Open to everyone (Public)</span>
                </label>
              </div>

              {!newMeeting.isPublic && (
                <div>
                  <label className="block text-sm font-medium mb-1">Select Participants</label>
                  <div className="max-h-32 overflow-y-auto border rounded-xl p-2 space-y-2">
                    {educators.map(edu => (
                      <label key={edu._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input 
                          type="checkbox" 
                          checked={newMeeting.attendees.includes(edu._id)}
                          onChange={e => {
                            const newAttendees = e.target.checked 
                              ? [...newMeeting.attendees, edu._id]
                              : newMeeting.attendees.filter(id => id !== edu._id);
                            setNewMeeting({...newMeeting, attendees: newAttendees});
                          }}
                          className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6]" 
                        />
                        <div className="flex items-center gap-2">
                          <img src={edu.profilePhoto || `https://ui-avatars.com/api/?name=${edu.fullName}`} className="w-6 h-6 rounded-full object-cover" alt="avatar" />
                          <span className="text-sm">{edu.fullName}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-3 mt-4 bg-[#8B5CF6] text-gray-900 font-bold rounded-xl hover:bg-[#7C3AED] transition">
                Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelConfirm(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-3xl text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Meeting?</h3>
            <p className="text-gray-500 mb-8">This action cannot be undone. Are you sure you want to permanently cancel this meeting?</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Go Back
              </button>
              <button 
                onClick={() => {
                  handleCancel(showCancelConfirm);
                  setShowCancelConfirm(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
