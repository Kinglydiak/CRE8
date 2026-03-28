import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AuthContext from './context/AuthContext';
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
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import CoursePlayer from './pages/CoursePlayer';
import MentorCourses from './pages/MentorCourses';
import MentorCourseEditor from './pages/MentorCourseEditor';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import './App.css';

// Inner layout component that has access to AuthContext
function AppContent() {
  const { user } = useContext(AuthContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Course player gets full-width experience (no sidebar)
  const isFullscreenRoute = location.pathname.includes('/learn');

  const showSidebar = user && !isFullscreenRoute;
  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div className={`App${showSidebar ? ' app-with-sidebar' : ''}`}>
      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(c => !c)}
        />
      )}
      {!user && <Navbar />}

      <div
        className="app-main"
        style={showSidebar ? { marginLeft: sidebarWidth } : {}}
      >
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
          <Route path="/courses" element={<Courses />} />
          <Route
            path="/courses/my"
            element={
              <PrivateRoute allowedRoles={['mentee']}>
                <MyCourses />
              </PrivateRoute>
            }
          />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route
            path="/courses/:id/learn"
            element={
              <PrivateRoute allowedRoles={['mentee', 'mentor', 'admin']}>
                <CoursePlayer />
              </PrivateRoute>
            }
          />
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
          <Route path="/dashboard" element={<Dashboard />} />
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
            path="/mentor/courses"
            element={
              <PrivateRoute allowedRoles={['mentor']}>
                <MentorCourses />
              </PrivateRoute>
            }
          />
          <Route
            path="/mentor/courses/new"
            element={
              <PrivateRoute allowedRoles={['mentor']}>
                <MentorCourseEditor />
              </PrivateRoute>
            }
          />
          <Route
            path="/mentor/courses/:id/edit"
            element={
              <PrivateRoute allowedRoles={['mentor']}>
                <MentorCourseEditor />
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
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

