import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <h2>Cre8</h2>
          </Link>

          <div className="navbar-menu">
            {user ? (
              <>
                {user.role === 'mentee' && (
                  <>
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/mentors" className="nav-link">Find Mentors</Link>
                    <Link to="/bookings" className="nav-link">My Bookings</Link>
                    <Link to="/messages" className="nav-link">Messages</Link>
                  </>
                )}

                {user.role === 'mentor' && (
                  <>
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/mentor/bookings" className="nav-link">Bookings</Link>
                    <Link to="/mentor/resources" className="nav-link">Resources</Link>
                    <Link to="/mentor/wallet" className="nav-link">💰 Wallet</Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/admin/users" className="nav-link">Users</Link>
                    <Link to="/admin/analytics" className="nav-link">Analytics</Link>
                  </>
                )}

                <div className="nav-user">
                  <span className="user-name">{user.name}</span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
