// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');

  // If there's a token, render the child component (e.g., DigitalId page)
  // Otherwise, redirect to the /signin page
  return token ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;