import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';
import './App.css';

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-300 opacity-80 animate-gradient z-0"></div>

      {/* App Content */}
      <div className="relative z-10">
        <Toaster />
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
