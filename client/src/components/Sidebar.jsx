import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHome, FiPlusSquare, FiUser, FiVideo, FiMessageSquare, FiLogOut, FiX } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome className="text-2xl" /> },
    { name: 'Upload', path: '/upload', icon: <FiPlusSquare className="text-2xl" /> },
    { name: 'Messages', path: '/messages', icon: <FiMessageSquare className="text-2xl" /> },
    { name: 'Meetings', path: '/meetings', icon: <FiVideo className="text-2xl" /> },
    { name: 'Profile', path: `/profile/${user?.username || 'me'}`, icon: <FiUser className="text-2xl" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Content */}
      <div className={`h-screen w-64 glass border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 bg-white ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6">
          <div className="mb-8 flex justify-between items-center w-full">
            <img src={logo} alt="VOCAL Logo" className="w-full max-w-[120px] h-auto object-contain mx-auto lg:mx-0" />
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
          
          <nav className="space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
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
    </>
  );
};

export default Sidebar;
