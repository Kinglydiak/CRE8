import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrolledCourses } from '../services/courseService';
import './Courses.css';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEnrolledCourses()
      .then(data => setCourses(data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6366f1';
    }
  };

  return (
    <div className="courses-page">
      <div className="container" style={{ paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0 }}>My Courses</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Courses you have enrolled in</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>
            Browse More Courses
          </button>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>No Enrolled Courses Yet</h3>
            <p>Browse our course marketplace and enroll in courses to start learning.</p>
            <button className="btn btn-primary" onClick={() => navigate('/courses')}>
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="course-cards-grid">
            {courses.map(course => (
              <div
                key={course._id}
                className="course-card"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <div className="course-card-thumb">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} />
                  ) : (
                    <div className="course-thumb-placeholder">
                      <span>{course.title.charAt(0)}</span>
                    </div>
                  )}
                  <span
                    className="course-level-tag"
                    style={{ backgroundColor: getLevelColor(course.level) }}
                  >
                    {course.level}
                  </span>
                  <span className="enrolled-badge">Enrolled</span>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">
                    {course.description
                      ? (course.description.length > 90
                          ? course.description.substring(0, 90) + '...'
                          : course.description)
                      : 'No description available.'}
                  </p>
                  {course.mentor && (
                    <div className="course-card-mentor">
                      <img
                        src={course.mentor.profilePicture || '/default-avatar.png'}
                        alt={course.mentor.name}
                        className="course-mentor-avatar"
                      />
                      <span>{course.mentor.name}</span>
                    </div>
                  )}
                  <div className="course-card-meta">
                    {course.duration && <span className="meta-tag">{course.duration}</span>}
                    {course.category && <span className="meta-tag">{course.category}</span>}
                  </div>
                  <div className="course-card-footer">
                    <span className="course-price">
                      {course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/courses/${course._id}/learn`)}
                    >
                      Open Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
