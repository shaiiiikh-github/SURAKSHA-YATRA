// src/components/Header.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // This effect checks if an access token exists in local storage when the component loads.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    // Remove the token from storage
    localStorage.removeItem('accessToken');
    // Update the state to reflect logout
    setIsLoggedIn(false);
    // Redirect to the landing page
    navigate('/');
  };

  return (
    <header className="absolute top-0 left-0 w-full z-30 bg-transparent text-white">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          SafeTravel
        </Link>
        
        {/* --- DESKTOP NAVIGATION --- */}
        <nav className="hidden md:flex items-center space-x-6">
          {isLoggedIn ? (
            // --- Logged-In User Links ---
            <>
              <Link to="/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
              <Link to="/digital-id" className="hover:text-yellow-400 transition-colors">My Digital ID</Link>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105">
                Logout
              </button>
            </>
          ) : (
            // --- Logged-Out User Links ---
            <>
              <a href="/#features" className="hover:text-yellow-400 transition-colors">Features</a>
              <a href="/#impact" className="hover:text-yellow-400 transition-colors">Our Impact</a>
              <Link to="/signin" className="hover:text-yellow-400 transition-colors">Sign In</Link>
              <Link to="/signup">
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-2 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </nav>

        {/* --- MOBILE NAVIGATION --- */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700 bg-opacity-95 backdrop-blur-sm">
           {isLoggedIn ? (
            <nav className="flex flex-col items-center space-y-6 py-8">
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg">Dashboard</Link>
              <Link to="/digital-id" onClick={() => setIsOpen(false)} className="text-lg">My Digital ID</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="bg-red-500 text-white px-8 py-3 rounded-lg font-semibold">
                Logout
              </button>
            </nav>
          ) : (
            <nav className="flex flex-col items-center space-y-6 py-8">
              <a href="/#features" onClick={() => setIsOpen(false)} className="text-lg">Features</a>
              <a href="/#impact" onClick={() => setIsOpen(false)} className="text-lg">Our Impact</a>
              <Link to="/signin" onClick={() => setIsOpen(false)} className="text-lg">Sign In</Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <button className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold">
                  Get Started
                </button>
              </Link>
            </nav>
          )}
        </div>
      )}
    </header>
  );
}