import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to their dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Empower Your Creative Journey</h1>
            <p className="hero-subtitle">
              Connect with experienced mentors across Africa and transform your creative potential
            </p>
            <div className="hero-buttons">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
                  <Link to="/mentors" className="btn btn-secondary btn-lg">Find Mentors</Link>
                </>
              ) : (
                <Link to="/mentors" className="btn btn-primary btn-lg">Explore Mentors</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Cre8?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Expert Mentors</h3>
              <p>Learn from industry professionals with proven track records</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Flexible Learning</h3>
              <p>Schedule sessions at your convenience and learn at your own pace</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>African Focus</h3>
              <p>Mentorship tailored to the African creative industry landscape</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"></div>
              <h3>Affordable</h3>
              <p>Access quality mentorship at prices that work for you</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of creatives transforming their careers</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg">Create Your Account</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
