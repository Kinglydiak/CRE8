import React, { useState, useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Dashboard.css';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];

const MenteeSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    profilePicture: '',
    interests: '',
    goals: '',
    skillLevel: 'beginner',
    education: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : user.interests || '',
        goals: user.goals || '',
        skillLevel: user.skillLevel || 'beginner',
        education: user.education || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const payload = {
        ...formData,
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean)
      };
      const response = await axios.put('/api/mentees/profile', payload);
      if (response.data?.data) {
        updateUser(response.data.data);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Profile Settings</h1>
            <p className="dashboard-subtitle">Manage your personal information</p>
          </div>
        </div>

        <div className="settings-card">
          {/* Avatar */}
          <div className="settings-avatar-section">
            <img
              src={formData.profilePicture || '/default-avatar.png'}
              alt="Profile"
              className="settings-avatar"
            />
            <div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
              >
                {photoUploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="settings-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +250 788 000 000"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Kigali, Rwanda"
                />
              </div>

              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="form-group full-width">
                <label>Interests <span className="hint">(comma-separated)</span></label>
                <input
                  type="text"
                  name="interests"
                  className="form-control"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="e.g. Music, Art, Web Development"
                />
              </div>

              <div className="form-group full-width">
                <label>Goals</label>
                <textarea
                  name="goals"
                  className="form-control"
                  rows={2}
                  value={formData.goals}
                  onChange={handleChange}
                  placeholder="What do you want to achieve through mentorship?"
                />
              </div>

              <div className="form-group">
                <label>Skill Level</label>
                <select
                  name="skillLevel"
                  className="form-control"
                  value={formData.skillLevel}
                  onChange={handleChange}
                >
                  {SKILL_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Education</label>
                <input
                  type="text"
                  name="education"
                  className="form-control"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. University of Rwanda"
                />
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenteeSettings;
