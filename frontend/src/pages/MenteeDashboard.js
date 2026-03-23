import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../services/bookingService';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

const MenteeDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookings();
      const bookingList = data.data || [];
      setBookings(bookingList.slice(0, 5));

      // Calculate stats
      const now = new Date();
      const upcoming = bookingList.filter(b =>
        new Date(b.sessionDate) > now && b.status !== 'cancelled'
      ).length;
      const completed = bookingList.filter(b => b.status === 'completed').length;

      setStats({
        totalBookings: bookingList.length,
        upcomingBookings: upcoming,
        completedSessions: completed,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="empty-state">
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn btn-primary">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p className="dashboard-subtitle">Here's your learning journey overview</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/mentors" className="btn btn-primary">
              Find Mentors
            </Link>
            <Link to="/mentee/settings" className="btn btn-secondary">
              Settings
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.upcomingBookings}</h3>
              <p>Upcoming Sessions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completedSessions}</h3>
              <p>Completed Sessions</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/mentors" className="action-card">
              <div className="action-icon">🔍</div>
              <h3>Find a Mentor</h3>
              <p>Browse and connect with experienced mentors</p>
            </Link>
            <Link to="/bookings" className="action-card">
              <div className="action-icon">📋</div>
              <h3>My Bookings</h3>
              <p>View and manage your mentorship sessions</p>
            </Link>
            <Link to="/messages" className="action-card">
              <div className="action-icon">💬</div>
              <h3>Messages</h3>
              <p>Chat with your mentors</p>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/bookings" className="view-all">View All →</Link>
          </div>
          
          {bookings.length > 0 ? (
            <div className="bookings-list-compact">
              {bookings.map(booking => (
                <div key={booking._id} className="booking-item-compact">
                  <div className="booking-mentor-info">
                    <img 
                      src={booking.mentor?.profilePicture || '/default-avatar.png'} 
                      alt={booking.mentor?.name || 'Mentor'}
                      className="mentor-avatar-small"
                    />
                    <div>
                      <h4>{booking.mentor?.name || 'Unknown Mentor'}</h4>
                      <p className="booking-topic">{booking.topic}</p>
                    </div>
                  </div>
                  <div className="booking-meta">
                    <span className="booking-date">
                      {new Date(booking.sessionDate).toLocaleDateString()}
                    </span>
                    <span className={`status-badge-small status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No bookings yet</p>
              <Link to="/mentors" className="btn btn-primary">Find Your First Mentor</Link>
            </div>
          )}
        </div>

        {/* Learning Progress */}
        <div className="dashboard-section">
          <h2>Your Learning Journey</h2>
          <div className="progress-card">
            <div className="progress-info">
              <h3>Keep Going! 🎯</h3>
              <p>You've completed {stats.completedSessions} mentorship sessions. 
                 {stats.completedSessions < 5 
                   ? ' Book more sessions to accelerate your growth!' 
                   : ' You\'re making great progress!'}
              </p>
            </div>
            {stats.completedSessions > 0 && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${Math.min((stats.completedSessions / 10) * 100, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeDashboard;
