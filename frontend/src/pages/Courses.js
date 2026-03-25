import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../services/courseService';
import AuthContext from '../context/AuthContext';
import './Courses.css';

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const CATEGORIES = ['All', 'Design', 'Photography', 'Video', 'Music', 'Writing', 'Marketing', 'Business', 'Tech', 'Other'];

const Courses = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, [category, level]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search.trim()) filters.search = search.trim();
      if (category !== 'All') filters.category = category;
      if (level !== 'All Levels') filters.level = level;
      const data = await getAllCourses(filters);
      setCourses(data.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

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
      <div className="courses-hero">
        <div className="container">
          <h1>Explore Courses</h1>
          <p>Learn from Africa's top creative professionals at your own pace</p>
          <form className="courses-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search courses, topics, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="courses-search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="courses-layout">
          {/* Sidebar Filters */}
          <aside className="courses-sidebar">
            <div className="filter-section">
              <h3>Category</h3>
              <div className="filter-options">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`filter-option-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-section">
              <h3>Level</h3>
              <div className="filter-options">
                {LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    className={`filter-option-btn ${level === lvl ? 'active' : ''}`}
                    onClick={() => setLevel(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Course Grid */}
          <div className="courses-main">
            <div className="courses-toolbar">
              <span className="courses-count">{courses.length} course{courses.length !== 1 ? 's' : ''} found</span>
              {user && user.role === 'mentee' && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/courses/my')}>
                  My Enrolled Courses
                </button>
              )}
            </div>

            {loading ? (
              <div className="spinner"></div>
            ) : courses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"></div>
                <h3>No Courses Found</h3>
                <p>Try adjusting your search or filters.</p>
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
                        <span className="meta-tag">{course.enrollments} enrolled</span>
                      </div>

                      <div className="course-card-footer">
                        <span className="course-price">
                          {course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
                        </span>
                        <button className="btn btn-primary btn-sm">View Course</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
