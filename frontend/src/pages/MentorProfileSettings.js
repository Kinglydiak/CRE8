import React, { useState, useContext, useEffect, useRef } from 'react';
import { updateMentorProfile } from '../services/mentorService';
import { getMentorCourses, createCourse, updateCourse, deleteCourse } from '../services/courseService';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Dashboard.css';

const MentorProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    expertise: '',
    pricePerSession: '',
    availability: [],
    profilePicture: '',
    languages: '',
    experience: '',
    education: ''
  });

  // Course management
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', price: '', currency: 'RWF',
    duration: '', category: '', level: 'All Levels', topics: '', thumbnail: ''
  });
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        expertise: Array.isArray(user.expertise) ? user.expertise.join(', ') : user.expertise || '',
        pricePerSession: user.pricePerSession || '',
        availability: user.availability || [],
        profilePicture: user.profilePicture || '',
        languages: Array.isArray(user.languages) ? user.languages.join(', ') : user.languages || '',
        experience: user.experience || '',
        education: user.education || ''
      });
      fetchCourses(user._id);
    }
  }, [user]);

  const fetchCourses = async (mentorId) => {
    try {
      const data = await getMentorCourses(mentorId);
      setCourses(data.data || []);
    } catch (_) { /* silently ignore */ }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvailabilityToggle = (day) => {
    setFormData({
      ...formData,
      availability: formData.availability.includes(day)
        ? formData.availability.filter(d => d !== day)
        : [...formData.availability, day]
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setPhotoUploading(true);
      const data = new FormData();
      data.append('avatar', file);
      const res = await axios.post('/api/upload/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, profilePicture: res.data.url }));
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error('Photo upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Process form data
      const updateData = {
        ...formData,
        expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e),
        languages: formData.languages.split(',').map(l => l.trim()).filter(l => l),
        pricePerSession: Number(formData.pricePerSession)
      };

      const response = await updateMentorProfile(updateData);
      
      // Update user in context
      if (response.data) {
        updateUser(response.data);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const openNewCourse = () => {
    setEditingCourse(null);
    setCourseForm({ title: '', description: '', price: '', currency: 'RWF', duration: '', category: '', level: 'All Levels', topics: '', thumbnail: '' });
    setShowCourseModal(true);
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      price: course.price,
      currency: course.currency || 'RWF',
      duration: course.duration || '',
      category: course.category || '',
      level: course.level || 'All Levels',
      topics: Array.isArray(course.topics) ? course.topics.join(', ') : '',
      thumbnail: course.thumbnail || ''
    });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      setCourseLoading(true);
      const payload = { ...courseForm, price: Number(courseForm.price) };
      if (editingCourse) {
        await updateCourse(editingCourse._id, payload);
        toast.success('Course updated!');
      } else {
        await createCourse(payload);
        toast.success('Course created!');
      }
      setShowCourseModal(false);
      fetchCourses(user._id);
    } catch (error) {
      toast.error('Failed to save course: ' + (error.response?.data?.message || error.message));
    } finally {
      setCourseLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted');
      fetchCourses(user._id);
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Profile Settings</h1>
            <p className="dashboard-subtitle">Update your availability, pricing, and profile information</p>
          </div>
        </div>

        <div className="dashboard-section">
          <form onSubmit={handleSubmit} className="profile-settings-form">
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Photo</label>
                <div className="photo-upload-area">
                  <div className="photo-preview-wrap">
                    {formData.profilePicture ? (
                      <img
                        src={formData.profilePicture}
                        alt="Profile"
                        className="photo-preview"
                      />
                    ) : (
                      <div className="photo-preview-empty">
                        <span></span>
                      </div>
                    )}
                  </div>
                  <div className="photo-upload-actions">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handlePhotoChange}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => fileInputRef.current.click()}
                      disabled={photoUploading}
                    >
                      {photoUploading ? 'Uploading…' : 'Choose Photo'}
                    </button>
                    {formData.profilePicture && (
                      <button
                        type="button"
                        className="btn btn-danger-outline"
                        onClick={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                      >
                        Remove
                      </button>
                    )}
                    <small>JPG, PNG, WebP or GIF · max 5 MB</small>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell mentees about yourself, your background, and what you can help them with..."
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="form-section">
              <h2>Professional Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Expertise (comma-separated)</label>
                  <input
                    type="text"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleInputChange}
                    placeholder="e.g., Graphic Design, UI/UX, Branding"
                  />
                </div>
                <div className="form-group">
                  <label>Languages (comma-separated)</label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    placeholder="e.g., English, French, Swahili"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div className="form-group">
                  <label>Education</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g., Bachelor's in Design"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Availability */}
            <div className="form-section">
              <h2>Pricing & Availability</h2>
              <div className="form-group">
                <label>Price per Session (RWF) *</label>
                <input
                  type="number"
                  name="pricePerSession"
                  value={formData.pricePerSession}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                />
                <small>Set your hourly rate for mentorship sessions</small>
              </div>

              <div className="form-group">
                <label>Available Days</label>
                <div className="availability-grid">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`availability-day ${formData.availability.includes(day) ? 'selected' : ''}`}
                      onClick={() => handleAvailabilityToggle(day)}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <small>Select the days you're available for mentorship sessions</small>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* ── My Courses ─────────────────────────────────────── */}
        <div className="dashboard-section">
          <div className="dashboard-header" style={{ marginBottom: '20px' }}>
            <div>
              <h2>My Courses</h2>
              <p className="dashboard-subtitle">Create and manage the courses you offer to mentees</p>
            </div>
            <button className="btn btn-primary" onClick={openNewCourse}>+ Add Course</button>
          </div>

          {courses.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>You haven't created any courses yet. Click "Add Course" to get started.</p>
          ) : (
            <div className="courses-manage-list">
              {courses.map(course => (
                <div key={course._id} className="course-manage-card">
                  <div className="course-manage-info">
                    <strong>{course.title}</strong>
                    <span className="course-level-badge">{course.level}</span>
                    {course.category && <span className="course-cat-badge">{course.category}</span>}
                  </div>
                  <div className="course-manage-meta">
                    {course.duration && <span>{course.duration}</span>}
                    <span>{course.enrollments} enrolled</span>
                    <span className="course-price-badge">{course.price === 0 ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}</span>
                  </div>
                  <div className="course-manage-actions">
                    <button className="btn-sm btn-outline" onClick={() => openEditCourse(course)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="dashboard-section">
          <h2>Account Information</h2>
          <div className="account-stats-grid">
            <div className="account-stat">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="account-stat">
              <span className="stat-label">Account Type</span>
              <span className="stat-value">{user?.role || 'Mentor'}</span>
            </div>
            <div className="account-stat">
              <span className="stat-label">Total Ratings</span>
              <span className="stat-value">{user?.totalRatings || 0} reviews</span>
            </div>
            <div className="account-stat">
              <span className="stat-label">Average Rating</span>
              <span className="stat-value">
                {user?.rating ? `${user.rating.toFixed(1)}` : 'No ratings yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course Modal ────────────────────────────────────── */}
      {showCourseModal && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
            <form onSubmit={handleCourseSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Title *</label>
                  <input type="text" className="form-control" value={courseForm.title}
                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" className="form-control" placeholder="e.g. Music Production, Design"
                    value={courseForm.category}
                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3"
                  placeholder="What will students learn?"
                  value={courseForm.description}
                  onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Topics Covered (comma-separated)</label>
                <input type="text" className="form-control"
                  placeholder="e.g. Beat making, Mixing, Mastering"
                  value={courseForm.topics}
                  onChange={e => setCourseForm({ ...courseForm, topics: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input type="number" className="form-control" min="0" step="1"
                    placeholder="0 for free"
                    value={courseForm.price}
                    onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select className="form-control" value={courseForm.currency}
                    onChange={e => setCourseForm({ ...courseForm, currency: e.target.value })}>
                    <option value="RWF">RWF (Rwandan Franc)</option>
                    <option value="RWF">RWF</option>
                    <option value="EUR">EUR</option>
                    <option value="GHS">GHS (Cedi)</option>
                    <option value="NGN">NGN (Naira)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" className="form-control" placeholder="e.g. 4 weeks, 10 hours"
                    value={courseForm.duration}
                    onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select className="form-control" value={courseForm.level}
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
                    <option>All Levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>
                <input type="url" className="form-control" placeholder="https://..."
                  value={courseForm.thumbnail}
                  onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={courseLoading}>
                  {courseLoading ? 'Saving…' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfileSettings;
