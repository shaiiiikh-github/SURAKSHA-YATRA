// src/pages/Feedback.jsx

import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch feedback from the backend
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/feedback');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setError('Could not load feedback feed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch feedback when the component first loads
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim() || !placeName.trim()) {
      alert("Please enter a place and your feedback.");
      return;
    }

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newFeedback, placeName: placeName })
      });

      const data = await response.json();
      if (response.ok) {
        setNewFeedback('');
        setPlaceName('');
        fetchFeedbacks(); // Refresh the feed with the new post
        alert("Feedback submitted successfully!");
      } else {
        throw new Error(data.message || "Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Global Feedback</h1>
        <p className="text-gray-400 mt-2">See what other tourists are saying and share your own experiences.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Share Your Feedback</h2>
          <input
            type="text"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="Which place is this about? (e.g., Mumbai Airport)"
            className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            rows="3"
            className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button type="submit" className="w-full flex items-center justify-center p-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
            <PaperAirplaneIcon className="w-5 h-5 mr-2"/>
            Post Feedback
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Community Feed</h2>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading feedback...</p>
        ) : error ? (
           <p className="text-red-400 text-center">{error}</p>
        ) : (
          feedbacks.map(fb => (
            <div key={fb._id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 backdrop-blur-sm">
              <p className="text-white mb-2">{fb.text}</p>
              <div className="text-xs text-gray-400 flex justify-between items-center">
                
                {/* --- CORRECTED LINE: Using <strong> tags for bold text --- */}
                <span>
                  by <strong className="font-medium text-gray-200">{fb.authorUsername}</strong> about <strong className="font-medium text-gray-200">{fb.placeName}</strong>
                </span>
                
                <span className="text-gray-500">{new Date(fb.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}