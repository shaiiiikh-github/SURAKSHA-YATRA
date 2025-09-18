// src/components/PublicOnlyRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicOnlyRoute = () => {
  const token = localStorage.getItem('accessToken');

  // If a token exists, the user is logged in, so redirect them to the dashboard.
  // Otherwise, show the public page (like the Landing page).
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicOnlyRoute;