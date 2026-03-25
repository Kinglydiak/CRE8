import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus } from '../services/bookingService';
import { toast } from 'react-toastify';
import './Dashboard.css';

const MentorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmBookingId, setConfirmBookingId] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmModalMode, setConfirmModalMode] = useState('confirm'); // 'confirm' | 'update'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (bookingId, mode = 'confirm', existingLink = '') => {
    setConfirmBookingId(bookingId);
    setMeetingLink(existingLink);
    setConfirmModalMode(mode);
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      setConfirming(true);
      if (confirmModalMode === 'confirm') {
        await updateBookingStatus(confirmBookingId, 'confirmed', meetingLink);
        toast.success('Booking confirmed! Mentee has been notified.');
      } else {
        // update link only — keep status as confirmed
        await updateBookingStatus(confirmBookingId, 'confirmed', meetingLink);
        toast.success('Meeting link updated!');
      }
      setShowConfirmModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setConfirming(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDateStatus = (sessionDate) => {
    const today = new Date();
    const session = new Date(sessionDate);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sessionMidnight = new Date(session.getFullYear(), session.getMonth(), session.getDate());
    if (sessionMidnight.getTime() === todayMidnight.getTime()) return { label: 'TODAY', color: '#f97316' };
    if (sessionMidnight > todayMidnight) return { label: 'UPCOMING', color: '#6366f1' };
    return { label: 'PASSED', color: '#9ca3af' };
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Manage Bookings</h1>
            <p className="dashboard-subtitle">View and respond to session requests from your mentees</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({bookings.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="dashboard-section">
          {filteredBookings.length > 0 ? (
            <div className="bookings-detailed-list">
              {filteredBookings.map(booking => (
                <div key={booking._id} className="booking-card-detailed">
                  <div className="booking-card-header">
                    <div className="booking-user-info">
                      <img 
                        src={booking.mentee?.profilePicture || '/default-avatar.png'} 
                        alt={booking.mentee?.name}
                        className="booking-avatar"
                      />
                      <div>
                        <h3>{booking.mentee?.name || 'Unknown Mentee'}</h3>
                        <p className="user-email">{booking.mentee?.email || 'No email'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => { const ds = getDateStatus(booking.sessionDate); return (
                        <span className="status-badge" style={{ backgroundColor: ds.color }}>{ds.label}</span>
                      ); })()}
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="booking-detail-item">
                      <span className="detail-label">Topic:</span>
                      <span className="detail-value">{booking.topic}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">
                        {new Date(booking.sessionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{booking.sessionTime}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{booking.duration} minutes</span>
                    </div>
                    {booking.notes && (
                      <div className="booking-detail-item full-width">
                        <span className="detail-label">Notes:</span>
                        <p className="detail-value">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Meeting Link (shown when confirmed) */}
                  {booking.status === 'confirmed' && booking.meetingLink && (
                    <div className="booking-detail-item full-width" style={{ marginTop: '8px' }}>
                      <span className="detail-label">Meeting Link:</span>
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-value"
                        style={{ color: '#6366f1', wordBreak: 'break-all' }}
                      >
                        {booking.meetingLink}
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => openConfirmModal(booking._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="booking-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => openConfirmModal(booking._id, 'update', booking.meetingLink || '')}
                      >
                        {booking.meetingLink ? '✏️ Update Link' : '🔗 Add Meeting Link'}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      >
                        Mark as Completed
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>No {filter !== 'all' ? filter : ''} bookings</h3>

              <p>
                {filter === 'pending' 
                  ? 'You have no pending booking requests at the moment.'
                  : filter === 'confirmed'
                  ? 'You have no confirmed sessions scheduled.'
                  : filter === 'completed'
                  ? 'You haven\'t completed any sessions yet.'
                  : 'You don\'t have any bookings yet. Mentees will appear here when they book sessions with you.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm + Meeting Link Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h2 style={{ marginBottom: '8px' }}>{confirmModalMode === 'confirm' ? 'Confirm Booking' : 'Meeting Link'}</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
              {confirmModalMode === 'confirm'
                ? 'Paste your meeting link below (Google Meet, Zoom, etc.) so the mentee knows where to join.'
                : 'Update the meeting link for this session. The mentee will see it in their booking details.'}
            </p>
            <form onSubmit={handleConfirmBooking}>
              <div className="form-group">
                <label>Meeting Link <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional but recommended)</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={confirming}>
                  {confirming ? 'Saving...' : confirmModalMode === 'confirm' ? 'Confirm Booking' : 'Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorBookings;
