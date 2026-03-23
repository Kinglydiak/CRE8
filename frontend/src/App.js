import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import Bookings from './pages/Bookings';
import Resources from './pages/Resources';
import Dashboard from './pages/Dashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MentorBookings from './pages/MentorBookings';
import MentorResources from './pages/MentorResources';
import Messages from './pages/Messages';
import MentorProfileSettings from './pages/MentorProfileSettings';
import MenteeSettings from './pages/MenteeSettings';
import Wallet from './pages/Wallet';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <Router>
        <ErrorBoundary>
        <div className="App">
          <Navbar />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route 
              path="/bookings" 
              element={
                <PrivateRoute allowedRoles={['mentee', 'mentor', 'admin']}>
                  <Bookings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/resources" 
              element={
                <PrivateRoute allowedRoles={['mentee', 'mentor', 'admin']}>
                  <Resources />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <PrivateRoute allowedRoles={['mentee', 'mentor', 'admin']}>
                  <Messages />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={<Dashboard />} 
            />
            <Route 
              path="/mentee/dashboard" 
              element={
                <PrivateRoute allowedRoles={['mentee']}>
                  <MenteeDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mentor/dashboard" 
              element={
                <PrivateRoute allowedRoles={['mentor']}>
                  <MentorDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mentor/bookings" 
              element={
                <PrivateRoute allowedRoles={['mentor']}>
                  <MentorBookings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mentor/resources" 
              element={
                <PrivateRoute allowedRoles={['mentor']}>
                  <MentorResources />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mentor/profile" 
              element={
                <PrivateRoute allowedRoles={['mentor']}>
                  <MentorProfileSettings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mentor/wallet" 
              element={
                <PrivateRoute allowedRoles={['mentor']}>
                  <Wallet />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mentee/settings" 
              element={
                <PrivateRoute allowedRoles={['mentee']}>
                  <MenteeSettings />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
        </ErrorBoundary>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
