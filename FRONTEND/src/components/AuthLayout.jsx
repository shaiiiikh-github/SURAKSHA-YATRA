// src/components/AuthLayout.jsx

import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    // These classes are responsible for the centering
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
}