import React from 'react';
import './MentorCard.css';

const MentorCard = ({ mentor, onClick }) => {
  const isAvailable = mentor.availability && Array.isArray(mentor.availability) && mentor.availability.length > 0;
  
  return (
    <div className="mentor-card" onClick={() => onClick(mentor._id)}>
      {isAvailable && (
        <div className="availability-badge available">
          <span className="status-dot"></span> Available
        </div>
      )}
      
      <div className="mentor-card-header">
        <img 
          src={mentor.profilePicture || '/default-avatar.png'} 
          alt={mentor.name}
          className="mentor-avatar"
        />
        <div className="mentor-info">
          <h3>{mentor.name}</h3>
          <p className="mentor-location">{mentor.location || 'Remote'}</p>
        </div>
      </div>
      
      <div className="mentor-card-body">
        <p className="mentor-bio">
          {mentor.bio ? (mentor.bio.length > 100 ? mentor.bio.substring(0, 100) + '...' : mentor.bio) : 'Experienced mentor ready to guide you'}
        </p>
        
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className="mentor-skills">
            {mentor.expertise.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
            {mentor.expertise.length > 3 && (
              <span className="skill-tag more">+{mentor.expertise.length - 3}</span>
            )}
          </div>
        )}
        
        <div className="mentor-stats">
          <div className="stat">
            <span className="stat-icon"></span>
            <span className="stat-value">{mentor.rating ? mentor.rating.toFixed(1) : 'New'}</span>
            <span className="stat-label">({mentor.totalRatings || 0})</span>
          </div>
          <div className="stat">
            <span className="stat-icon"></span>
            <span className="stat-value">{mentor.completedSessions || 0}</span>
            <span className="stat-label">sessions</span>
          </div>
          <div className="stat">
            <span className="stat-icon"></span>
            <span className="stat-value">{(mentor.pricePerSession || 0).toLocaleString()} RWF</span>
            <span className="stat-label">/hr</span>
          </div>
        </div>
      </div>
      
      <div className="mentor-card-footer">
        <button className="btn btn-primary btn-block">View Profile & Book</button>
      </div>
    </div>
  );
};

export default MentorCard;
