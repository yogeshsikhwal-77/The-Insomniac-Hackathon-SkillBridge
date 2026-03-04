import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile'; 
import Chat from './components/Chat';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
        { /* Background decoration */ }
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-3xl opacity-50"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
        </div>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/chat/:targetUserId" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;