import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  const location = useLocation();

  if (!authToken) {
    // Agar token nahi hai, toh user ko login page par bhej dein
    // Saath mein ek state message bhi bhejenge taaki login page par toast dikha sakein
    return <Navigate 
      to="/" 
      replace 
      state={{ 
        from: location, 
        message: "You must login to access this page." 
      }} 
    />;
  }

  // Agar token hai, toh jo bhi page access karna hai, use render karein
  return children;
};

export default ProtectedRoute;
