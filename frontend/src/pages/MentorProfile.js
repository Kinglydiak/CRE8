import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMentor } from '../services/mentorService';
import { createBooking } from '../services/bookingService';
import { getMentorCourses, initiatePayment } from '../services/courseService';
import AuthContext from '../context/AuthContext';
import './MentorProfile.css';

const MentorProfile = () => {
  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ sessionDate: '', duration: 60, topic: '', notes: '' });
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingPayData, setBookingPayData] = useState({ phoneNumber: '', paymentMethod: 'mtn_momo' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [payData, setPayData] = useState({ phoneNumber: '', paymentMethod: 'mtn_momo' });
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState(null);

  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentor();
    fetchCourses();
    // eslint-disable-next-line
  }, [id]);

  const fetchMentor = async () => {
    try {
      setLoading(true);
      const data = await getMentor(id);
      setMentor(data.data);
    } catch (error) {
      console.error('Failed to fetch mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getMentorCourses(id);
      setCourses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const openPayModal = (course) => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'mentee') { alert('Only mentees can enroll in courses'); return; }
    setSelectedCourse(course);
    setPayData({ phoneNumber: '', paymentMethod: 'mtn_momo' });
    setPayResult(null);
    setShowPayModal(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payData.phoneNumber) return;
    try {
      setPayLoading(true);
      const result = await initiatePayment(selectedCourse._id, payData);
      setPayResult(result.data);
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setPayLoading(false);
    }
  };

  const calcBookingPrice = () => {
    const hrs = Number(bookingData.duration) / 60;
    return Math.round(hrs * (mentor?.pricePerSession || 0));
  };

  const openBookingModal = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'mentee') { alert('Only mentees can book sessions'); return; }
    setBookingStep(1);
    setBookingResult(null);
    setBookingPayData({ phoneNumber: '', paymentMethod: 'mtn_momo' });
    setShowBookingModal(true);
  };

  const handleBookingStep1 = (e) => {
    e.preventDefault();
    setBookingStep(2);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingPayData.phoneNumber) return;
    try {
      setBookingLoading(true);
      const result = await createBooking({
        mentorId: id,
        ...bookingData,
        phoneNumber: bookingPayData.phoneNumber,
        paymentMethod: bookingPayData.paymentMethod
      });
      setBookingResult(result.data);
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!mentor) {
    return <div className="container"><p>Mentor not found</p></div>;
  }

  return (
    <div className="mentor-profile-page">
      <div className="container">
        <div className="profile-header">
          <img 
            src={mentor.profilePicture || '/default-avatar.png'} 
            alt={mentor.name}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1>{mentor.name}</h1>
            <p className="profile-location">{mentor.location || 'Location not specified'}</p>
            <div className="profile-stats">
              <span>⭐ {mentor.rating ? mentor.rating.toFixed(1) : 'N/A'} ({mentor.totalRatings} ratings)</span>
              <span>• {mentor.completedSessions || 0} sessions completed</span>
              <span>• {(mentor.pricePerSession || 0).toLocaleString()} RWF/hour</span>
            </div>
            {user && user.role === 'mentee' && (
              <div className="profile-actions">
                <button 
                  className="btn btn-primary"
                  onClick={openBookingModal}
                >
                  Book a Session
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/messages', { state: { userId: mentor._id, userName: mentor.name, userPicture: mentor.profilePicture } })}
                >
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          <section className="profile-section">
            <h2>About</h2>
            <p>{mentor.bio || 'No bio available'}</p>
          </section>

          <section className="profile-section">
            <h2>Skills & Expertise</h2>
            <div className="skills-list">
              {mentor.skills && mentor.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
              {mentor.expertise && mentor.expertise.map((exp, index) => (
                <span key={index} className="skill-tag expertise">{exp}</span>
              ))}
            </div>
          </section>

          {mentor.experience && (
            <section className="profile-section">
              <h2>Experience</h2>
              <p>{mentor.experience}</p>
            </section>
          )}

          {mentor.certifications && mentor.certifications.length > 0 && (
            <section className="profile-section">
              <h2>Certifications</h2>
              <ul className="certifications-list">
                {mentor.certifications.map((cert, index) => (
                  <li key={index}>
                    <strong>{cert.title}</strong> - {cert.issuer}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Courses Section ─────────────────────────────────────── */}
          <section className="profile-section">
            <h2>Courses Offered</h2>
            {courses.length === 0 ? (
              <p className="no-courses-msg">This mentor hasn't posted any courses yet.</p>
            ) : (
              <div className="courses-grid">
                {courses.map(course => (
                  <div key={course._id} className="course-card">
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt={course.title} className="course-thumbnail" />
                    )}
                    <div className="course-card-body">
                      <div className="course-meta">
                        <span className="course-level">{course.level}</span>
                        {course.category && <span className="course-category">{course.category}</span>}
                      </div>
                      <h3 className="course-title">{course.title}</h3>
                      {course.description && <p className="course-desc">{course.description}</p>}
                      {course.topics && course.topics.length > 0 && (
                        <div className="course-topics">
                          {course.topics.map((t, i) => (
                            <span key={i} className="topic-tag">{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="course-footer">
                        <div className="course-info">
                          {course.duration && <span className="course-duration">⏱ {course.duration}</span>}
                          <span className="course-enrollments">👥 {course.enrollments} enrolled</span>
                        </div>
                        <div className="course-price-row">
                          <span className="course-price">
                            {course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
                          </span>
                          {user && user.role === 'mentee' && (
                            <button
                              className="btn btn-enroll"
                              onClick={() => openPayModal(course)}
                            >
                              {course.price === 0 ? 'Enroll Free' : 'Enroll & Pay'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Payment Modal ────────────────────────────────────────── */}
        {showPayModal && selectedCourse && (
          <div className="modal-overlay" onClick={() => { setShowPayModal(false); setPayResult(null); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              {payResult ? (
                <div className="pay-success">
                  <div className="pay-success-icon">✅</div>
                  <h2>Payment Initiated!</h2>
                  <p>Approve the prompt sent to <strong>{payResult.phoneNumber}</strong></p>
                  <div className="pay-summary">
                    <div className="pay-row"><span>Course</span><span>{payResult.courseTitle}</span></div>
                    <div className="pay-row"><span>Amount</span><span>{payResult.amount.toLocaleString()} {payResult.currency}</span></div>
                    <div className="pay-row"><span>Reference</span><span className="tx-ref">{payResult.transactionRef}</span></div>
                    <div className="pay-row"><span>Status</span><span className="status-pending">Pending</span></div>
                  </div>
                  <p className="pay-note">💡 Keep this reference in case you need to follow up.</p>
                  <button className="btn btn-primary" onClick={() => { setShowPayModal(false); setPayResult(null); }}>
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h2>Enroll in Course</h2>
                  <div className="pay-course-info">
                    <strong>{selectedCourse.title}</strong>
                    <span className="pay-amount">
                      {selectedCourse.price === 0 ? 'Free' : `${selectedCourse.price.toLocaleString()} ${selectedCourse.currency}`}
                    </span>
                  </div>
                  <form onSubmit={handlePaySubmit}>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select
                        className="form-control"
                        value={payData.paymentMethod}
                        onChange={e => setPayData({ ...payData, paymentMethod: e.target.value })}
                      >
                        <option value="mtn_momo">MTN Mobile Money</option>
                        <option value="orange_money">Orange Money</option>
                        <option value="moov_money">Moov Money</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mobile Money Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. +224 622 000 000"
                        value={payData.phoneNumber}
                        onChange={e => setPayData({ ...payData, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={payLoading}>
                        {payLoading ? 'Processing…' : selectedCourse.price === 0 ? 'Enroll Free' : `Pay ${selectedCourse.price.toLocaleString()} ${selectedCourse.currency}`}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {showBookingModal && (
          <div className="modal-overlay" onClick={() => { setShowBookingModal(false); setBookingResult(null); setBookingStep(1); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>

              {/* ── Success Screen ── */}
              {bookingResult ? (
                <div className="pay-success">
                  <div className="pay-success-icon">✅</div>
                  <h2>Booking & Payment Initiated!</h2>
                  <p>Approve the MoMo prompt sent to <strong>{bookingResult.phoneNumber}</strong></p>
                  <div className="pay-summary">
                    <div className="pay-row"><span>Mentor</span><span>{mentor.name}</span></div>
                    <div className="pay-row"><span>Date</span><span>{new Date(bookingResult.booking?.sessionDate).toLocaleString()}</span></div>
                    <div className="pay-row"><span>Duration</span><span>{bookingData.duration} min</span></div>
                    <div className="pay-row"><span>Amount</span><span>${calcBookingPrice()}</span></div>
                    <div className="pay-row"><span>Reference</span><span className="tx-ref">{bookingResult.transactionRef}</span></div>
                    <div className="pay-row"><span>Status</span><span className="status-pending">Pending</span></div>
                  </div>
                  <p className="pay-note">💡 Your booking will be confirmed once payment is verified.</p>
                  <button className="btn btn-primary" onClick={() => { setShowBookingModal(false); setBookingResult(null); setBookingStep(1); navigate('/bookings'); }}>
                    View My Bookings
                  </button>
                </div>
              ) : bookingStep === 1 ? (
                /* ── Step 1: Session Details ── */
                <>
                  <h2>Book a Session with {mentor.name}</h2>
                  <div className="booking-step-indicator">Step 1 of 2 — Session Details</div>
                  <form onSubmit={handleBookingStep1}>
                    <div className="form-group">
                      <label>Session Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={bookingData.sessionDate}
                        onChange={e => setBookingData({...bookingData, sessionDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <select
                        className="form-control"
                        value={bookingData.duration}
                        onChange={e => setBookingData({...bookingData, duration: e.target.value})}
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Topic</label>
                      <input
                        type="text"
                        className="form-control"
                        value={bookingData.topic}
                        onChange={e => setBookingData({...bookingData, topic: e.target.value})}
                        placeholder="What would you like to discuss?"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={bookingData.notes}
                        onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                        placeholder="Any specific questions or topics?"
                      ></textarea>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowBookingModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Continue to Payment →
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* ── Step 2: Payment ── */
                <>
                  <h2>Pay & Confirm Booking</h2>
                  <div className="booking-step-indicator">Step 2 of 2 — Payment</div>
                  <div className="pay-course-info">
                    <div>
                      <strong>Session with {mentor.name}</strong>
                      <p className="booking-pay-detail">{bookingData.duration} min · {bookingData.topic}</p>
                    </div>
                    <span className="pay-amount">
                      {mentor.pricePerSession > 0 ? `${calcBookingPrice().toLocaleString()} RWF` : 'Free'}
                    </span>
                  </div>
                  {mentor.pricePerSession > 0 ? (
                    <form onSubmit={handleBookingSubmit}>
                      <div className="form-group">
                        <label>Payment Method</label>
                        <select
                          className="form-control"
                          value={bookingPayData.paymentMethod}
                          onChange={e => setBookingPayData({ ...bookingPayData, paymentMethod: e.target.value })}
                        >
                          <option value="mtn_momo">MTN Mobile Money</option>
                          <option value="orange_money">Orange Money</option>
                          <option value="moov_money">Moov Money</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Mobile Money Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="e.g. +224 622 000 000"
                          value={bookingPayData.phoneNumber}
                          onChange={e => setBookingPayData({ ...bookingPayData, phoneNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setBookingStep(1)}>
                          ← Back
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                          {bookingLoading ? 'Processing…' : `Pay ${calcBookingPrice().toLocaleString()} RWF & Book`}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleBookingSubmit}>
                      <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setBookingStep(1)}>
                          ← Back
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                          {bookingLoading ? 'Processing…' : 'Confirm Booking'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorProfile;
