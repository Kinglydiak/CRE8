import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMentorOwnCourses, deleteCourse } from '../services/courseService';
import './MentorCourseEditor.css';

const MentorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await getMentorOwnCourses();
      setCourses(res.data || []);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(id);
      setCourses(c => c.filter(x => x._id !== id));
      toast.success('Course deleted');
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollments || 0), 0);
  const totalModules = courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0);

  if (loading) return <div className="spinner" />;

  return (
    <div className="mc-root">
      <div className="mc-header">
        <div>
          <h1>My Courses</h1>
          <p>Create, manage, and publish your courses</p>
        </div>
        <Link to="/mentor/courses/new" className="btn btn-primary">+ Create Course</Link>
      </div>

      {courses.length > 0 && (
        <div className="mc-summary-bar">
          <div className="mc-summary-item">
            <span className="mc-summary-num">{courses.length}</span>
            <span className="mc-summary-label">Total Courses</span>
          </div>
          <div className="mc-summary-item">
            <span className="mc-summary-num">{courses.filter(c => c.isActive).length}</span>
            <span className="mc-summary-label">Published</span>
          </div>
          <div className="mc-summary-item">
            <span className="mc-summary-num">{totalStudents}</span>
            <span className="mc-summary-label">Total Students</span>
          </div>
          <div className="mc-summary-item">
            <span className="mc-summary-num">{totalModules}</span>
            <span className="mc-summary-label">Total Modules</span>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="mc-empty">
          <div className="mc-empty-icon">📚</div>
          <h3>No courses yet</h3>
          <p>Create your first course to start sharing your knowledge with students.</p>
          <Link to="/mentor/courses/new" className="btn btn-primary">Create Your First Course</Link>
        </div>
      ) : (
        <div className="mc-grid">
          {courses.map(course => (
            <div key={course._id} className="mc-card">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="mc-thumb" />
              ) : (
                <div className="mc-thumb-placeholder">
                  <span>No Thumbnail</span>
                </div>
              )}
              <div className="mc-card-body">
                <div className="mc-card-top">
                  <h3>{course.title}</h3>
                  <span className={`mc-status ${course.isActive ? 'published' : 'draft'}`}>
                    {course.isActive ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mc-desc">{course.description || 'No description yet'}</p>
                <div className="mc-stats">
                  <span>{course.enrollments || 0} students</span>
                  <span>{(course.modules || []).length} modules</span>
                  <span>{course.price?.toLocaleString()} {course.currency}</span>
                </div>
              </div>
              <div className="mc-card-actions">
                <Link to={`/mentor/courses/${course._id}/edit`} className="btn btn-primary btn-sm">
                  Edit
                </Link>
                <a
                  href={`/courses/${course._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Preview
                </a>
                <button
                  onClick={() => handleDelete(course._id, course.title)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorCourses;
