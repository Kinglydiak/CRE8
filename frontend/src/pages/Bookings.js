import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking, addFeedback } from '../services/bookingService';
import AuthContext from '../context/AuthContext';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      const updated = data.data || [];
      setBookings(updated);
      // Keep selectedBooking in sync if the modal is open
      if (selectedBooking) {
        const fresh = updated.find(b => b._id === selectedBooking._id);
        if (fresh) setSelectedBooking(fresh);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        fetchBookings();
        alert('Booking cancelled successfully');
      } catch (error) {
        alert('Failed to cancel booking');
      }
    }
  };

  const handleOpenFeedback = (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleMentorClick = (e, mentorId) => {
    e.stopPropagation();
    if (mentorId) navigate(`/mentor/${mentorId}`);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await addFeedback(selectedBooking._id, feedback);
      alert('Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error) {
      alert('Failed to submit feedback');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

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
    <div className="bookings-page">
      <div className="container">
        <h1 className="page-title">My Bookings</h1>

        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'confirmed' ? 'active' : ''}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card clickable-card" onClick={() => handleOpenDetails(booking)}>
                <div className="booking-header">
                  <h3>
                    {user.role === 'mentee' ? (
                      <span
                        className="mentor-name-link"
                        onClick={(e) => handleMentorClick(e, booking.mentor?._id)}
                        title="View mentor profile"
                      >
                        Session with {booking.mentor?.name || 'Unknown Mentor'}
                      </span>
                    ) : (
                      `Session with ${booking.mentee?.name || 'Unknown Mentee'}`
                    )}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {(() => { const ds = getDateStatus(booking.sessionDate); return (
                      <span className="status-badge" style={{ backgroundColor: ds.color }}>{ds.label}</span>
                    ); })()}
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                
                <div className="booking-details">
                  <p><strong>Topic:</strong> {booking.topic}</p>
                  <p><strong>Date:</strong> {new Date(booking.sessionDate).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {booking.duration} minutes</p>
                  {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                </div>

                <div className="booking-actions" onClick={e => e.stopPropagation()}>
                  {booking.status === 'pending' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel
                    </button>
                  )}
                  
                  {booking.status === 'completed' && user.role === 'mentee' && !booking.feedback && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleOpenFeedback(booking)}
                    >
                      Leave Feedback
                    </button>
                  )}
                  
                  {booking.feedback && (
                    <div className="feedback-display">
                      <p><strong>Your Rating:</strong> {booking.feedback.rating}/5</p>
                      <p><strong>Comment:</strong> {booking.feedback.comment}</p>
                    </div>
                  )}

                  <span className="view-details-hint">Tap for details →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>No Bookings Found</h3>
            <p>
              {filter === 'all' 
                ? user.role === 'mentee'
                  ? "You haven't booked any sessions yet. Start your learning journey by finding a mentor!"
                  : "You don't have any bookings yet. Mentees will book sessions with you soon!"
                : `No ${filter} bookings at the moment.`
              }
            </p>
            {user.role === 'mentee' && filter === 'all' && (
              <a href="/mentors" className="btn btn-primary">
                Find Mentors
              </a>
            )}
          </div>
        )}

        {showDetailsModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content booking-details-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>X</button>
              <div className="details-modal-header">
                <div className={`details-status-badge status-${selectedBooking.status}`}>
                  {selectedBooking.status.toUpperCase()}
                </div>
                <h2>Session Details</h2>
              </div>

              <div className="details-section">
                <h4>Session Info</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Topic</span>
                    <span className="detail-value">{selectedBooking.topic}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date & Time</span>
                    <span className="detail-value">{new Date(selectedBooking.sessionDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{selectedBooking.duration} minutes</span>
                  </div>
                  {selectedBooking.notes && (
                    <div className="detail-item detail-item-full">
                      <span className="detail-label">Notes</span>
                      <span className="detail-value">{selectedBooking.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {user.role === 'mentee' && selectedBooking.mentor && (
                <div className="details-section">
                  <h4>Mentor</h4>
                  <div className="details-mentor-row">
                    {selectedBooking.mentor.profilePicture ? (
                      <img src={selectedBooking.mentor.profilePicture} alt={selectedBooking.mentor.name} className="details-mentor-avatar" />
                    ) : (
                      <div className="details-mentor-avatar-placeholder"></div>
                    )}
                    <div>
                      <div className="details-mentor-name">{selectedBooking.mentor.name}</div>
                      {selectedBooking.mentor.expertise && (
                        <div className="details-mentor-expertise">{selectedBooking.mentor.expertise.join(', ')}</div>
                      )}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => { setShowDetailsModal(false); navigate(`/mentors/${selectedBooking.mentor._id}`); }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              )}

              {user.role === 'mentor' && selectedBooking.mentee && (
                <div className="details-section">
                  <h4>Mentee</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{selectedBooking.mentee.name}</span>
                    </div>
                    {selectedBooking.mentee.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{selectedBooking.mentee.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedBooking.payment?.amount > 0 || selectedBooking.amount > 0) && (
                <div className="details-section">
                  <h4>Payment</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Amount Paid</span>
                      <span className="detail-value detail-value-highlight">
                        {((selectedBooking.payment?.amount || selectedBooking.amount) || 0).toLocaleString()} {selectedBooking.payment?.currency || 'RWF'}
                      </span>
                    </div>
                    {(selectedBooking.payment?.paymentMethod || selectedBooking.paymentMethod) && (
                      <div className="detail-item">
                        <span className="detail-label">Method</span>
                        <span className="detail-value">
                          {(selectedBooking.payment?.paymentMethod || selectedBooking.paymentMethod).replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Payment Status</span>
                      <span className={`detail-value status-badge status-${selectedBooking.payment?.status || 'pending'}`}>
                        {selectedBooking.payment?.status || 'pending'}
                      </span>
                    </div>
                    {(selectedBooking.payment?.transactionId || selectedBooking.transactionRef) && (
                      <div className="detail-item detail-item-full">
                        <span className="detail-label">Transaction Ref</span>
                        <span className="detail-value detail-ref">
                          {selectedBooking.payment?.transactionId || selectedBooking.transactionRef}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.feedback && (
                <div className="details-section">
                  <h4>Feedback</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Rating</span>
                      <span className="detail-value">{selectedBooking.feedback.rating}/5</span>
                    </div>
                    {selectedBooking.feedback.comment && (
                      <div className="detail-item detail-item-full">
                        <span className="detail-label">Comment</span>
                        <span className="detail-value">{selectedBooking.feedback.comment}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting Link — shown to mentee when confirmed */}
              {selectedBooking.status === 'confirmed' && user.role === 'mentee' && (
                <div className="details-section">
                  <h4>Join Your Session</h4>
                  {selectedBooking.meetingLink ? (
                    <a
                      href={selectedBooking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}
                    >
                      🎥 Join Session
                    </a>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                      ⏳ Waiting for your mentor to add the meeting link. Check back soon!
                    </p>
                  )}
                </div>
              )}

              {/* Meeting Link — shown to mentor too */}
              {selectedBooking.status === 'confirmed' && selectedBooking.meetingLink && user.role === 'mentor' && (
                <div className="details-section">
                  <h4>Meeting Link</h4>
                  <a
                    href={selectedBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6366f1', wordBreak: 'break-all', fontSize: '0.85rem' }}
                  >
                    {selectedBooking.meetingLink}
                  </a>
                </div>
              )}

              <div className="details-modal-footer">
                {selectedBooking.status === 'pending' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => { setShowDetailsModal(false); handleCancelBooking(selectedBooking._id); }}
                  >
                    Cancel Booking
                  </button>
                )}
                {selectedBooking.status === 'completed' && user.role === 'mentee' && !selectedBooking.feedback && (
                  <button
                    className="btn btn-primary"
                    onClick={() => { setShowDetailsModal(false); handleOpenFeedback(selectedBooking); }}
                  >
                    Leave Feedback
                  </button>
                )}
                <button className="btn btn-secondary" onClick={fetchBookings} style={{ marginRight: 'auto' }}>↻ Refresh</button>
                <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showFeedbackModal && (
          <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Leave Feedback</h2>
              <form onSubmit={handleSubmitFeedback}>
                <div className="form-group">
                  <label>Rating</label>
                  <select
                    className="form-control"
                    value={feedback.rating}
                    onChange={e => setFeedback({...feedback, rating: Number(e.target.value)})}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Below Average</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={feedback.comment}
                    onChange={e => setFeedback({...feedback, comment: e.target.value})}
                    placeholder="Share your experience..."
                    required
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
