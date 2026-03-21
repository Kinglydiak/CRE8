import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../services/bookingService';
import { getWallet } from '../services/walletService';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

const MentorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    completedSessions: 0,
    walletBalance: 0,
    walletCurrency: 'RWF'
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
      const [bookingRes, walletRes] = await Promise.allSettled([getBookings(), getWallet()]);
      const bookingList = bookingRes.status === 'fulfilled' ? (bookingRes.value?.data || []) : [];
      const walletData = walletRes.status === 'fulfilled' ? walletRes.value?.data : null;
      setBookings(bookingList.slice(0, 5));

      const pending = bookingList.filter(b => b.status === 'pending').length;
      const completed = bookingList.filter(b => b.status === 'completed').length;

      setStats({
        totalBookings: bookingList.length,
        pendingRequests: pending,
        completedSessions: completed,
        walletBalance: walletData?.balance || 0,
        walletCurrency: walletData?.currency || 'RWF'
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
            <p className="dashboard-subtitle">Manage your mentorship sessions and profile</p>
          </div>
          <Link to="/mentor/profile" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <h3>{stats.pendingRequests}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completedSessions}</h3>
              <p>Completed Sessions</p>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{stats.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {stats.walletCurrency}</h3>
              <p>Wallet Balance</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/mentor/bookings" className="action-card">
              <div className="action-icon">📅</div>
              <h3>Manage Bookings</h3>
              <p>View and respond to session requests</p>
            </Link>
            <Link to="/mentor/resources" className="action-card">
              <div className="action-icon">📚</div>
              <h3>Share Resources</h3>
              <p>Upload materials for your mentees</p>
            </Link>
            <Link to="/messages" className="action-card">
              <div className="action-icon">💬</div>
              <h3>Messages</h3>
              <p>Chat with your mentees</p>
            </Link>
            <Link to="/mentor/profile" className="action-card">
              <div className="action-icon">⚙️</div>
              <h3>Profile Settings</h3>
              <p>Update your availability and pricing</p>
            </Link>
            <Link to="/mentor/wallet" className="action-card">
              <div className="action-icon">💰</div>
              <h3>My Wallet</h3>
              <p>View earnings & withdraw to MoMo</p>
            </Link>
          </div>
        </div>

        {/* Pending Requests */}
        {stats.pendingRequests > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Pending Booking Requests</h2>
              <Link to="/mentor/bookings" className="view-all">View All →</Link>
            </div>
            
            <div className="bookings-list-compact">
              {bookings
                .filter(b => b.status === 'pending')
                .slice(0, 3)
                .map(booking => (
                  <div key={booking._id} className="booking-item-compact pending-request">
                    <div className="booking-mentor-info">
                      <img 
                        src={booking.mentee?.profilePicture || '/default-avatar.png'} 
                        alt={booking.mentee?.name || 'Mentee'}
                        className="mentor-avatar-small"
                      />
                      <div>
                        <h4>{booking.mentee?.name || 'Unknown Mentee'}</h4>
                        <p className="booking-topic">{booking.topic}</p>
                      </div>
                    </div>
                    <div className="booking-meta">
                      <span className="booking-date">
                        {new Date(booking.sessionDate).toLocaleDateString()}
                      </span>
                      <Link to="/mentor/bookings" className="btn btn-primary btn-sm">
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Sessions</h2>
            <Link to="/mentor/bookings" className="view-all">View All →</Link>
          </div>
          
          {bookings.length > 0 ? (
            <div className="bookings-list-compact">
              {bookings
                .filter(b => b.status !== 'pending')
                .slice(0, 5)
                .map(booking => (
                  <div key={booking._id} className="booking-item-compact">
                    <div className="booking-mentor-info">
                      <img 
                        src={booking.mentee?.profilePicture || '/default-avatar.png'} 
                        alt={booking.mentee?.name || 'Mentee'}
                        className="mentor-avatar-small"
                      />
                      <div>
                        <h4>{booking.mentee?.name || 'Unknown Mentee'}</h4>
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
              <p>No sessions yet</p>
              <p className="empty-state-subtitle">Your mentees will appear here once they book sessions with you</p>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="dashboard-section">
          <h2>Your Impact</h2>
          <div className="progress-card">
            <div className="progress-info">
              <h3>Great Work! 🌟</h3>
              <p>You've mentored {stats.completedSessions} sessions. 
                 {stats.completedSessions < 10 
                   ? ' Keep building your reputation!' 
                   : ' You\'re making a real impact in the creative community!'}
              </p>
              {user?.rating > 0 && (
                <p className="rating-display">
                  Your Rating: ⭐ {user.rating.toFixed(1)} ({user.totalRatings} reviews)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
