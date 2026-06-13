import React, { useContext, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { FiMenu } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Layout = () => {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 min-h-screen text-gray-900 flex-col lg:flex-row">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 glass border-b border-gray-200 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <img src={logo} alt="VOCAL Logo" className="h-8 object-contain" />
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
        >
          <FiMenu className="text-2xl" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 min-h-screen overflow-x-hidden">
        <div className="w-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
