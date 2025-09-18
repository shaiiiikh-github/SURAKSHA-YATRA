// src/components/FeedbackSystem.jsx
import React, { useState } from "react";
import {
  StarIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  ShareIcon,
  FlagIcon,
  PhotoIcon,
  MapPinIcon,
  FaceSmileIcon
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid
} from "@heroicons/react/24/solid";

const FeedbackSystem = ({ showFeedbackModal, setShowFeedbackModal, feedbacks, setFeedbacks }) => {
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    comment: "",
    location: "",
    category: "general",
    images: []
  });
  const [activeFeedbackTab, setActiveFeedbackTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Feedback categories
  const feedbackCategories = [
    { id: "accommodation", name: "Accommodation", icon: "🏨" },
    { id: "transportation", name: "Transportation", icon: "🚗" },
    { id: "food", name: "Food", icon: "🍽️" },
    { id: "attractions", name: "Attractions", icon: "🏛️" },
    { id: "safety", name: "Safety", icon: "🛡️" },
    { id: "general", name: "General", icon: "💬" }
  ];

  // Filter feedback based on active tab and category
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (activeFeedbackTab === "all" && selectedCategory === "all") return true;
    if (activeFeedbackTab === "my" && feedback.user !== "Current User") return false;
    if (selectedCategory !== "all" && feedback.category !== selectedCategory) return false;
    return true;
  });

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const newFeedbackItem = {
      id: feedbacks.length + 1,
      user: "Current User",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      location: newFeedback.location,
      category: newFeedback.category,
      date: "Just now",
      likes: 0,
      liked: false,
      comments: [],
      shares: 0
    };
    
    setFeedbacks([newFeedbackItem, ...feedbacks]);
    setNewFeedback({
      rating: 5,
      comment: "",
      location: "",
      category: "general",
      images: []
    });
    setShowFeedbackModal(false);
  };

  const handleLikeFeedback = (id) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === id 
        ? { 
            ...feedback, 
            likes: feedback.liked ? feedback.likes - 1 : feedback.likes + 1,
            liked: !feedback.liked
          } 
        : feedback
    ));
  };

  const renderStars = (rating, size = "h-5 w-5") => {
    return Array.from({ length: 5 }).map((_, index) => (
      index < rating ? (
        <StarIconSolid key={index} className={`${size} text-yellow-400`} />
      ) : (
        <StarIcon key={index} className={`${size} text-gray-300`} />
      )
    ));
  };

  const FeedbackItem = ({ feedback }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <img 
            src={feedback.avatar} 
            alt={feedback.user} 
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-medium text-gray-900">{feedback.user}</h4>
            <div className="flex items-center mt-1">
              <div className="flex">
                {renderStars(feedback.rating, "h-4 w-4")}
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">{feedback.date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
          <MapPinIcon className="h-4 w-4" />
          <span className="text-sm">{feedback.location}</span>
        </div>
      </div>
      
      <div className="mt-3 pl-13">
        <p className="text-gray-700">{feedback.comment}</p>
        
        {feedback.images && feedback.images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {feedback.images.map((img, index) => (
              <img key={index} src={img} alt="" className="rounded-lg object-cover h-32 w-full" />
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleLikeFeedback(feedback.id)}
              className={`flex items-center space-x-1 ${feedback.liked ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {feedback.liked ? (
                <HandThumbUpIconSolid className="h-5 w-5" />
              ) : (
                <HandThumbUpIcon className="h-5 w-5" />
              )}
              <span className="text-sm">{feedback.likes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500">
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
              <span className="text-sm">{feedback.comments.length}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500">
              <ShareIcon className="h-5 w-5" />
              <span className="text-sm">{feedback.shares}</span>
            </button>
          </div>
          
          <button className="text-gray-400 hover:text-gray-600">
            <FlagIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Share Your Experience</h2>
                <button 
                  onClick={() => setShowFeedbackModal(false)} 
                  className="text-white hover:bg-white/10 p-1 rounded-full"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-indigo-100 mt-1">Help other travelers by sharing your experience</p>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="p-5">
              <div className="mb-6">
                <label className="block text-gray-700 mb-3 font-medium">How would you rate your experience?</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback({...newFeedback, rating: star})}
                      className="focus:outline-none transform hover:scale-110 transition-transform"
                    >
                      {star <= newFeedback.rating ? (
                        <StarIconSolid className="h-10 w-10 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-10 w-10 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Location</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={newFeedback.location}
                      onChange={(e) => setNewFeedback({...newFeedback, location: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Where did you visit?"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Category</label>
                  <select
                    value={newFeedback.category}
                    onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {feedbackCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Share your experience</label>
                <div className="relative">
                  <textarea
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows="4"
                    placeholder="Tell us about your experience... What did you like? What could be improved?"
                    required
                  ></textarea>
                  <div className="absolute bottom-3 right-3">
                    <FaceSmileIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Add photos (optional)</label>
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    <PhotoIcon className="h-8 w-8" />
                    <span className="text-xs mt-1">Add photo</span>
                  </button>
                  
                  {newFeedback.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt="" className="h-24 w-24 rounded-lg object-cover" />
                      <button 
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => setNewFeedback({
                          ...newFeedback, 
                          images: newFeedback.images.filter((_, i) => i !== index)
                        })}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Share Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback List Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b px-5 pt-5 pb-4">
          <h2 className="text-xl font-semibold text-gray-800">Traveler Experiences</h2>
          <p className="text-gray-600 mt-1">See what other travelers are saying about their experiences</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => {
                setActiveFeedbackTab("all");
                setSelectedCategory("all");
              }}
              className={`px-3 py-1.5 rounded-full text-sm ${activeFeedbackTab === "all" && selectedCategory === "all" ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
            >
              All Experiences
            </button>
            
            <button
              onClick={() => setActiveFeedbackTab("my")}
              className={`px-3 py-1.5 rounded-full text-sm ${activeFeedbackTab === "my" ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
            >
              My Reviews
            </button>
            
            {feedbackCategories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveFeedbackTab("all");
                  setSelectedCategory(category.id);
                }}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${selectedCategory === category.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-5">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback yet</h3>
              <p className="text-gray-500">
                {selectedCategory !== "all" 
                  ? `No ${feedbackCategories.find(c => c.id === selectedCategory)?.name} experiences shared yet.` 
                  : "Be the first to share your experience!"}
              </p>
              <button 
                onClick={() => setShowFeedbackModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Share Your Experience
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredFeedbacks.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackSystem;