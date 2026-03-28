import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Send admin back to their dashboard instead of the homepage
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} />;
  }

  return children;
};

export default PrivateRoute;
