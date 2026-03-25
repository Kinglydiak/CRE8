import React, { useState, useEffect, useContext } from 'react';
import { getResources, uploadResource, deleteResource } from '../services/resourceService';
import AuthContext from '../context/AuthContext';
import { FaFilePdf, FaFileWord, FaFileVideo, FaFileImage, FaFileAlt, FaDownload, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import './Resources.css';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf',
    category: 'tutorials',
    accessLevel: 'public'
  });
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getResources();
      setResources(data.data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      await uploadResource(newResource);
      alert('Resource uploaded successfully!');
      setShowUploadModal(false);
      setNewResource({
        title: '',
        description: '',
        fileUrl: '',
        fileType: 'pdf',
        category: 'tutorials',
        accessLevel: 'public'
      });
      fetchResources();
    } catch (error) {
      alert('Failed to upload resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(resourceId);
        alert('Resource deleted successfully');
        fetchResources();
      } catch (error) {
        alert('Failed to delete resource');
      }
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="file-icon word" />;
      case 'video':
      case 'mp4':
        return <FaFileVideo className="file-icon video" />;
      case 'image':
      case 'jpg':
      case 'png':
        return <FaFileImage className="file-icon image" />;
      default:
        return <FaFileAlt className="file-icon default" />;
    }
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="resources-page">
      <div className="container">
        <div className="resources-header">
          <div>
            <h1 className="page-title">Learning Resources</h1>
            <p className="page-subtitle">
              {user.role === 'mentor' 
                ? 'Manage and share resources with your mentees'
                : 'Browse and download resources from mentors'
              }
            </p>
          </div>
          {user.role === 'mentor' && (
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
              <FaPlus /> Upload Resource
            </button>
          )}
        </div>

        <div className="resources-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button 
              className={categoryFilter === 'all' ? 'active' : ''}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            <button 
              className={categoryFilter === 'tutorials' ? 'active' : ''}
              onClick={() => setCategoryFilter('tutorials')}
            >
              Tutorials
            </button>
            <button 
              className={categoryFilter === 'templates' ? 'active' : ''}
              onClick={() => setCategoryFilter('templates')}
            >
              Templates
            </button>
            <button 
              className={categoryFilter === 'tools' ? 'active' : ''}
              onClick={() => setCategoryFilter('tools')}
            >
              Tools
            </button>
            <button 
              className={categoryFilter === 'references' ? 'active' : ''}
              onClick={() => setCategoryFilter('references')}
            >
              References
            </button>
          </div>
        </div>

        {filteredResources.length > 0 ? (
          <div className="resources-grid">
            {filteredResources.map(resource => (
              <div key={resource._id} className="resource-card">
                <div className="resource-icon-wrapper">
                  {getFileIcon(resource.fileType)}
                </div>
                
                <div className="resource-content">
                  <h3 className="resource-title">{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                  
                  <div className="resource-meta">
                    <span className="category-badge">{resource.category}</span>
                    <span className="access-badge">{resource.accessLevel}</span>
                  </div>

                  {resource.mentor && (
                    <p className="resource-author">
                      By {resource.mentor.name}
                    </p>
                  )}

                  <div className="resource-stats">
                    <span>{resource.downloads || 0} downloads</span>
                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="resource-actions">
                    <a 
                      href={resource.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <FaDownload /> Download
                    </a>
                    
                    {user.role === 'mentor' && resource.mentor._id === user._id && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteResource(resource._id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <h3>No Resources Found</h3>
            <p>
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : user.role === 'mentor'
                  ? 'Start by uploading your first resource to share with mentees'
                  : 'No resources are available yet. Check back later!'
              }
            </p>
            {user.role === 'mentor' && !searchTerm && categoryFilter === 'all' && (
              <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                <FaPlus /> Upload Your First Resource
              </button>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content resource-modal" onClick={e => e.stopPropagation()}>
              <h2>Upload New Resource</h2>
              <form onSubmit={handleUploadResource}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newResource.title}
                    onChange={e => setNewResource({...newResource, title: e.target.value})}
                    placeholder="e.g., Complete Guide to UI Design"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newResource.description}
                    onChange={e => setNewResource({...newResource, description: e.target.value})}
                    placeholder="Describe what this resource contains..."
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>File URL *</label>
                  <input
                    type="url"
                    className="form-control"
                    value={newResource.fileUrl}
                    onChange={e => setNewResource({...newResource, fileUrl: e.target.value})}
                    placeholder="https://example.com/file.pdf"
                    required
                  />
                  <small className="form-text">Provide a link to your file (Google Drive, Dropbox, etc.)</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>File Type *</label>
                    <select
                      className="form-control"
                      value={newResource.fileType}
                      onChange={e => setNewResource({...newResource, fileType: e.target.value})}
                    >
                      <option value="pdf">PDF</option>
                      <option value="doc">Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-control"
                      value={newResource.category}
                      onChange={e => setNewResource({...newResource, category: e.target.value})}
                    >
                      <option value="tutorials">Tutorials</option>
                      <option value="templates">Templates</option>
                      <option value="tools">Tools</option>
                      <option value="references">References</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Access Level *</label>
                  <select
                    className="form-control"
                    value={newResource.accessLevel}
                    onChange={e => setNewResource({...newResource, accessLevel: e.target.value})}
                  >
                    <option value="public">Public - Anyone can access</option>
                    <option value="mentees_only">Mentees Only - Only your mentees</option>
                    <option value="premium">Premium - Paid content only</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Upload Resource
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

export default Resources;
