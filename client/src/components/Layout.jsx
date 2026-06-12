import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 min-h-screen text-gray-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
