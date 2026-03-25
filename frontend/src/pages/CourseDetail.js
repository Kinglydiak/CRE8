import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, initiatePayment } from '../services/courseService';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Courses.css';
import './CoursePlayer.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await getCourse(id);
      setCourse(data.data);
      // Expand first module by default
      if (data.data?.modules?.length > 0) {
        setExpandedModules({ [data.data.modules[0]._id]: true });
      }
    } catch (err) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const totalLessons = (modules) =>
    modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return toast.error('Enter your MoMo phone number');
    try {
      setPaying(true);
      const result = await initiatePayment(course._id, { phoneNumber, paymentMethod: 'mtn_momo' });
      setPayResult(result.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleFreeEnroll = async () => {
    try {
      setPaying(true);
      const result = await initiatePayment(course._id, { phoneNumber: '0000000000', paymentMethod: 'free' });
      setPayResult(result.data);
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setPaying(false);
    }
  };

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6366f1';
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '80px' }}></div>;
  if (!course) return <div className="container" style={{ marginTop: '80px' }}><p>Course not found.</p></div>;

  return (
    <div className="course-detail-page">
      {/* Hero */}
      <div className="course-detail-hero">
        <div className="container">
          <div className="course-detail-hero-content">
            <div className="course-detail-info">
              <div className="course-detail-badges">
                <span className="course-level-tag" style={{ backgroundColor: getLevelColor(course.level) }}>{course.level}</span>
                {course.category && <span className="meta-tag">{course.category}</span>}
              </div>
              <h1>{course.title}</h1>
              <p className="course-detail-desc">{course.description}</p>
              {course.mentor && (
                <div
                  className="course-detail-mentor"
                  onClick={() => navigate(`/mentor/${course.mentor._id}`)}
                >
                  <img
                    src={course.mentor.profilePicture || '/default-avatar.png'}
                    alt={course.mentor.name}
                    className="course-mentor-avatar"
                  />
                  <span>By <strong>{course.mentor.name}</strong></span>
                </div>
              )}
              <div className="course-detail-stats">
                {course.duration && <span>{course.duration}</span>}
                <span>{course.enrollments} enrolled</span>
              </div>
            </div>

            {/* Enroll Card */}
            <div className="course-enroll-card">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="course-enroll-thumb" />
              ) : (
                <div className="course-enroll-thumb-placeholder">
                  <span>{course.title.charAt(0)}</span>
                </div>
              )}
              <div className="course-enroll-price">
                {course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
              </div>
              {user?.role === 'mentee' ? (
                course.isEnrolled ? (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => navigate(`/courses/${course._id}/learn`)}
                  >
                    Open Course
                  </button>
                ) : course.price === 0 ? (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleFreeEnroll}
                    disabled={paying}
                  >
                    {paying ? 'Enrolling...' : 'Enroll for Free'}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => setShowPayModal(true)}
                  >
                    Enroll & Pay
                  </button>
                )
              ) : !user ? (
                <button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>
                  Login to Enroll
                </button>
              ) : (
                <p className="hint">Only mentees can enroll in courses</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container">
        <div className="course-detail-body">
          {course.topics && course.topics.length > 0 && (
            <div className="course-section">
              <h2>What You'll Learn</h2>
              <div className="topics-grid">
                {course.topics.map((topic, i) => (
                  <div key={i} className="topic-item">
                    <span className="topic-check">✓</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {course.description && (
            <div className="course-section">
              <h2>About This Course</h2>
              <p>{course.description}</p>
            </div>
          )}

          {/* Curriculum Accordion */}
          {course.modules && course.modules.length > 0 && (
            <div className="course-section">
              <h2>Course Curriculum</h2>
              <p className="curriculum-subtitle">
                {course.modules.length} modules &middot; {totalLessons(course.modules)} lessons
              </p>
              <div className="curriculum-accordion">
                {course.modules.map((mod, mIdx) => (
                  <div key={mod._id || mIdx} className="curriculum-module">
                    <button
                      className="curriculum-module-header"
                      onClick={() => toggleModule(mod._id || mIdx)}
                    >
                      <div className="curriculum-module-left">
                        <span className="curriculum-module-num">Module {mod.order || mIdx + 1}</span>
                        <span className="curriculum-module-title">{mod.title}</span>
                      </div>
                      <div className="curriculum-module-right">
                        <span className="curriculum-module-count">
                          {mod.lessons?.length || 0} lessons
                        </span>
                        <span className="curriculum-chevron">
                          {expandedModules[mod._id || mIdx] ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>
                    {expandedModules[mod._id || mIdx] && (
                      <ul className="curriculum-lessons">
                        {(mod.lessons || []).map((lesson, lIdx) => (
                          <li key={lesson._id || lIdx} className="curriculum-lesson">
                            <span className="curriculum-lesson-icon">
                              {lesson.isFreePreview ? (
                                <span className="icon-preview">▶</span>
                              ) : (
                                <span className="icon-lock">🔒</span>
                              )}
                            </span>
                            <span className="curriculum-lesson-title">{lesson.title}</span>
                            <span className="curriculum-lesson-right">
                              {lesson.isFreePreview && (
                                <span className="preview-tag">Preview</span>
                              )}
                              {lesson.duration && (
                                <span className="curriculum-lesson-dur">{lesson.duration}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {course.mentor && (
            <div className="course-section">
              <h2>Your Instructor</h2>
              <div
                className="instructor-card"
                onClick={() => navigate(`/mentor/${course.mentor._id}`)}
              >
                <img
                  src={course.mentor.profilePicture || '/default-avatar.png'}
                  alt={course.mentor.name}
                  className="instructor-avatar"
                />
                <div>
                  <h3>{course.mentor.name}</h3>
                  {course.mentor.location && <p>{course.mentor.location}</p>}
                  {course.mentor.rating > 0 && <p>Rating: {course.mentor.rating.toFixed(1)}</p>}
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => { setShowPayModal(false); setPayResult(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {payResult ? (
              <div className="pay-success">
                <div className="pay-success-icon"></div>
                <h2>Payment Initiated!</h2>
                <p>Approve the MoMo prompt sent to <strong>{payResult.phoneNumber}</strong></p>
                <div className="pay-summary">
                  <div className="pay-row"><span>Course</span><span>{payResult.courseTitle}</span></div>
                  <div className="pay-row"><span>Amount</span><span>{payResult.amount?.toLocaleString()} {payResult.currency}</span></div>
                  <div className="pay-row"><span>Reference</span><span className="tx-ref">{payResult.transactionRef}</span></div>
                  <div className="pay-row"><span>Status</span><span className="status-pending">Pending</span></div>
                </div>
                <p className="pay-note">Keep this reference in case you need to follow up.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => { setShowPayModal(false); setPayResult(null); navigate(`/courses/${course._id}/learn`); }}>
                    Start Learning
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setShowPayModal(false); setPayResult(null); navigate('/courses/my'); }}>
                    My Courses
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2>Enroll in Course</h2>
                <div className="pay-course-info">
                  <strong>{course.title}</strong>
                  <span className="course-price">{course.price.toLocaleString()} {course.currency}</span>
                </div>
                <form onSubmit={handleEnroll}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>MTN Mobile Money Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 0781234567"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      required
                    />
                    <small>You'll receive a payment prompt on this number</small>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={paying}>
                      {paying ? 'Processing...' : 'Pay Now'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
