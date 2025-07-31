import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components aur Pages import karein
import Authpage from "./pages/Authpage";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import Dashboard from "./pages/Dashboard";
import Test from "./pages/Test";
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Naya component import karein

import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login page sabke liye accessible hai */}
        <Route path="/" element={<Authpage />} />

        {/* Protected Routes: Yeh routes sirf logged-in users hi access kar sakte hain */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/meeting" 
          element={
            <ProtectedRoute>
              <Meeting />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/test" 
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          } 
        />
        
        {/* Optional: Aap /h route ko bhi protect kar sakte hain ya hata sakte hain */}
        <Route 
          path="/h" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
