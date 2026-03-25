import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMentors } from '../services/mentorService';
import MentorCard from '../components/MentorCard';
import './Mentors.css';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    available: false
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  const navigate = useNavigate();

  // Popular skills based on mentor expertise
  const popularSkills = [
    'Painting',
    'Digital Art',
    'Graphic Design',
    'Illustration',
    'Music Production',
    'Singing',
    'Creative Writing',
    'Web Development',
    'Data Science',
    'Film Direction',
    'Cinematography',
    'Business Strategy',
    'Fashion Design',
    'Photography',
    'Dance Choreography',
    'Animation',
    'UI/UX Design',
    'Video Editing',
    'Screenwriting',
    'Game Development',
    'Mixed Media',
    'Branding',
    'Sound Engineering',
    'Beat Making',
    'Piano',
    'Music Composition',
    'Storytelling',
    'Copywriting',
    'Content Strategy',
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Figma',
    'Filmmaking',
    'Documentary',
    'Entrepreneurship',
    'Pattern Making',
    'Portrait Photography',
    'Photo Editing',
    'Contemporary Dance',
    'African Dance',
    '3D Modeling',
    'Blender'
  ];

  useEffect(() => {
    fetchMentors();
    // eslint-disable-next-line
  }, []);

  const fetchMentors = async (filterParams = {}) => {
    try {
      setLoading(true);
      const data = await getMentors(filterParams);
      setMentors(data.data || []);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillToggle = (skill) => {
    const newSelectedSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSelectedSkills);
    
    // Update filters and trigger search
    const skillsString = newSelectedSkills.join(',');
    const updatedFilters = {
      ...filters,
      skills: skillsString
    };
    setFilters(updatedFilters);
    
    // Auto-search when skills change
    const activeFilters = {};
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key]) {
        activeFilters[key] = updatedFilters[key];
      }
    });
    fetchMentors(activeFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        activeFilters[key] = filters[key];
      }
    });
    fetchMentors(activeFilters);
  };

  const handleMentorClick = (mentorId) => {
    navigate(`/mentor/${mentorId}`);
  };

  return (
    <div className="mentors-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Find Your Mentor</h1>
          <p className="page-subtitle">Browse and connect with experienced mentors ready to guide your journey</p>
        </div>
        
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              placeholder="Search by name, expertise, or keywords..."
              className="form-control search-input"
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="skills-filter-section">
            <h3 className="filter-section-title">Filter by Skills</h3>
            <div className="skills-tags">
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-tag ${selectedSkills.includes(skill) ? 'active' : ''}`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <button
                type="button"
                className="clear-skills-btn"
                onClick={() => {
                  setSelectedSkills([]);
                  setFilters({...filters, skills: ''});
                  const activeFilters = {};
                  Object.keys({...filters, skills: ''}).forEach(key => {
                    if (filters[key] && key !== 'skills') {
                      activeFilters[key] = filters[key];
                    }
                  });
                  fetchMentors(activeFilters);
                }}
              >
                Clear Skills ({selectedSkills.length})
              </button>
            )}
          </div>

          <div className="filters">
            <div className="price-filter-group">
              <input
                type="number"
                name="minPrice"
                placeholder="Min $"
                className="form-control"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
              <span className="filter-separator">-</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max $"
                className="form-control"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
            <select
              name="rating"
              className="form-control"
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
            <label className="checkbox-filter">
              <input
                type="checkbox"
                name="available"
                checked={filters.available}
                onChange={(e) => setFilters({...filters, available: e.target.checked})}
              />
              <span>Available Now</span>
            </label>
          </div>
        </div>

        {!loading && (
          <div className="results-summary">
            <p>{mentors.length} mentor{mentors.length !== 1 ? 's' : ''} found</p>
          </div>
        )}

        {loading ? (
          <div className="spinner"></div>
        ) : mentors.length > 0 ? (
          <div className="mentors-grid">
            {mentors.map(mentor => (
              <MentorCard 
                key={mentor._id} 
                mentor={mentor} 
                onClick={handleMentorClick}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No Mentors Found</h3>
            <p>Try adjusting your search filters or browse all available mentors.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setFilters({
                  search: '',
                  skills: '',
                  minPrice: '',
                  maxPrice: '',
                  rating: '',
                  available: false
                });
                setSelectedSkills([]);
                fetchMentors();
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
