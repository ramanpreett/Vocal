import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHome, FiPlusSquare, FiUser, FiVideo, FiMessageSquare, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome className="text-2xl" /> },
    { name: 'Upload', path: '/upload', icon: <FiPlusSquare className="text-2xl" /> },
    { name: 'Profile', path: `/profile/${user?.username || 'me'}`, icon: <FiUser className="text-2xl" /> },
    { name: 'Meetings', path: '/meetings', icon: <FiVideo className="text-2xl" /> },
    { name: 'Messages', path: '/messages', icon: <FiMessageSquare className="text-2xl" /> },
  ];

  return (
    <div className="h-screen w-64 glass border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-[#8B5CF6] mb-8 tracking-wider">VOCAL</h1>
        
        <nav className="space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-4 p-3 rounded-xl transition duration-200 ${
                  isActive 
                    ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span className="text-lg">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-4 p-3 w-full text-left rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition duration-200"
        >
          <FiLogOut className="text-2xl" />
          <span className="text-lg">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
