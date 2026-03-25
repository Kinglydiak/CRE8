import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdCalendarToday, MdMessage, MdBook,
  MdFolder, MdSettings, MdLogout, MdAccountBalanceWallet,
  MdPeople, MdMenu, MdClose
} from 'react-icons/md';
import AuthContext from '../context/AuthContext';
import './Sidebar.css';

const mentorLinks = [
  { to: '/mentor/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/mentor/bookings', icon: MdCalendarToday, label: 'Bookings' },
  { to: '/mentor/courses', icon: MdBook, label: 'My Courses' },
  { to: '/mentor/resources', icon: MdFolder, label: 'Resources' },
  { to: '/messages', icon: MdMessage, label: 'Messages' },
  { to: '/mentor/wallet', icon: MdAccountBalanceWallet, label: 'Wallet' },
];

const menteeLinks = [
  { to: '/mentee/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/mentors', icon: MdPeople, label: 'Find Mentors' },
  { to: '/bookings', icon: MdCalendarToday, label: 'My Bookings' },
  { to: '/courses', icon: MdBook, label: 'Courses' },
  { to: '/courses/my', icon: MdFolder, label: 'My Courses' },
  { to: '/messages', icon: MdMessage, label: 'Messages' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = user?.role === 'mentor' ? mentorLinks : menteeLinks;
  const settingsPath = user?.role === 'mentor' ? '/mentor/profile' : '/mentee/settings';

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && <div className="sidebar-overlay" onClick={onToggle} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && <span className="sidebar-brand-text">Cre8</span>}
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <MdMenu /> : <MdClose />}
          </button>
        </div>

        {/* User avatar area */}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <span className="sidebar-icon"><Icon /></span>
              {!collapsed && <span className="sidebar-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to={settingsPath}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            title={collapsed ? 'Settings' : undefined}
          >
            <span className="sidebar-icon"><MdSettings /></span>
            {!collapsed && <span className="sidebar-label">Settings</span>}
          </NavLink>
          <button className="sidebar-link sidebar-logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
            <span className="sidebar-icon"><MdLogout /></span>
            {!collapsed && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
