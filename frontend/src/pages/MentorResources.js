import React, { useState, useEffect, useContext } from 'react';
import { uploadResource, getResourcesByMentor, deleteResource } from '../services/resourceService';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const MentorResources = () => {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    url: '',
    category: 'general',
    accessLevel: 'mentees_only'
  });

  useEffect(() => {
    if (user?._id) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getResourcesByMentor(user._id);
      setResources(data.data || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // Map frontend type to backend fileType
      const typeMapping = {
        'pdf': 'document',
        'document': 'document',
        'video': 'video',
        'link': 'link'
      };
      
      const resourceData = {
        title: formData.title,
        description: formData.description,
        fileUrl: formData.url,
        fileType: typeMapping[formData.type] || 'other',
        category: formData.category,
        accessLevel: formData.accessLevel || 'mentees_only'
      };
      
      await uploadResource(resourceData);
      toast.success('Resource uploaded successfully!');
      setShowUploadForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        url: '',
        category: 'general',
        accessLevel: 'mentees_only'
      });
      fetchResources();
    } catch (error) {
      console.error('Failed to upload resource:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(resourceId);
        toast.success('Resource deleted successfully');
        fetchResources();
      } catch (error) {
        console.error('Failed to delete resource:', error);
        toast.error('Failed to delete resource');
      }
    }
  };

  const getResourceIcon = (type) => {
    switch(type) {
      case 'pdf':
      case 'document': return '📄';
      case 'video': return '🎥';
      case 'link': return '🔗';
      case 'audio': return '🎵';
      default: return '📦';
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'general': '#6b7280',
      'tutorial': '#6366f1',
      'template': '#8b5cf6',
      'guide': '#10b981',
      'tool': '#f59e0b'
    };
    return colors[category] || '#6b7280';
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>📚 Share Resources</h1>
            <p className="dashboard-subtitle">Upload and manage learning materials for your mentees</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? '✗ Cancel' : '+ Upload Resource'}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="dashboard-section">
            <h2>Upload New Resource</h2>
            <form onSubmit={handleSubmit} className="resource-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Beginner's Guide to Design"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video</option>
                    <option value="link">External Link</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="general">General</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="template">Template</option>
                    <option value="guide">Guide</option>
                    <option value="tool">Tool</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Resource URL *</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/resource.pdf"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what mentees will learn from this resource..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Resource'}
              </button>
            </form>
          </div>
        )}

        {/* Resources List */}
        <div className="dashboard-section">
          <h2>Your Resources ({resources.length})</h2>
          
          {resources.length > 0 ? (
            <div className="resources-grid">
              {resources.map(resource => (
                <div key={resource._id} className="resource-card">
                  <div className="resource-header">
                    <div className="resource-icon-large">
                      {getResourceIcon(resource.fileType)}
                    </div>
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryBadge(resource.category) }}
                    >
                      {resource.category}
                    </span>
                  </div>
                  
                  <h3>{resource.title}</h3>
                  <p className="resource-description">
                    {resource.description || 'No description provided'}
                  </p>
                  
                  <div className="resource-meta">
                    <span className="resource-type">{resource.fileType?.toUpperCase()}</span>
                    <span className="resource-date">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="resource-actions">
                    <a 
                      href={resource.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View
                    </a>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(resource._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No resources yet</h3>
              <p>Start sharing valuable learning materials with your mentees by uploading your first resource.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadForm(true)}
              >
                Upload Your First Resource
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorResources;
