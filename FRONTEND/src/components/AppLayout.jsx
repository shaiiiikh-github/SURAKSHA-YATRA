// src/components/AppLayout.jsx

import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 relative overflow-x-hidden">
      {/* --- Dynamic Aurora Background Effect --- */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-[5%] -left-16 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-[10%] -right-16 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      {/* --- Main App Container --- */}
      <div className="relative z-10">
        <nav className="bg-gray-900/30 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-white">SafeTravel</Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/digital-id" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Digital ID</Link>
                
                {/* --- ADD THIS NEW LINK --- */}
                <Link to="/feedback" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Feedback</Link>
                
                <button onClick={handleLogout} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}