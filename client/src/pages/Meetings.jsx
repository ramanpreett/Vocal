import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiVideo, FiPlus, FiX } from 'react-icons/fi';
import api from '../api/axios';

const Meetings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [meetings, setMeetings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '', date: '', time: '' });

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/api/meetings');
      setMeetings(res.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/meetings', newMeeting);
      setIsModalOpen(false);
      setNewMeeting({ title: '', description: '', date: '', time: '' });
      fetchMeetings();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  // Determine if a meeting is past or upcoming
  const today = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= today);
  const pastMeetings = meetings.filter(m => new Date(m.date) < today);

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
                <h3 className="text-xl font-bold mb-1">{meeting.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><FiCalendar /> {new Date(meeting.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><FiClock /> {meeting.time}</span>
                  <span>Hosted by {meeting.host?.fullName || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            {activeTab === 'Upcoming' && (
              <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#8B5CF6] text-[#8B5CF6] font-semibold rounded-xl hover:bg-[#8B5CF6] hover:text-gray-900 transition">
                <FiVideo /> Join Meeting
              </button>
            )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              <button type="submit" className="w-full py-3 mt-4 bg-[#8B5CF6] text-gray-900 font-bold rounded-xl hover:bg-[#7C3AED] transition">
                Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
