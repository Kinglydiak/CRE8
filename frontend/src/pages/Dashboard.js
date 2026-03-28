import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect to appropriate dashboard based on role
  if (user.role === 'mentor') {
    return <Navigate to="/mentor/dashboard" />;
  } else if (user.role === 'mentee') {
    return <Navigate to="/mentee/dashboard" />;
  } else if (user.role === 'admin') {
    return <Navigate to="/admin/analytics" />;
  } else {
    return <Navigate to="/" />;
  }
};

export default Dashboard;
