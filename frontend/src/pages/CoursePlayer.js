import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseContent } from '../services/courseService';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import './CoursePlayer.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

const PROGRESS_KEY = (courseId) => `course_progress_${courseId}`;

const loadProgress = (courseId) => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY(courseId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProgress = (courseId, completed) => {
  try {
    localStorage.setItem(PROGRESS_KEY(courseId), JSON.stringify(completed));
  } catch {
    // ignore
  }
};

// Classify a video URL: 'youtube' | 'local' | 'external' | null
const classifyVideo = (url) => {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (url.startsWith('/uploads/')) return 'local';
  if (/\.(mp4|webm|mov|m4v|avi)$/i.test(url)) return 'local';
  return 'external';
};

// Convert YouTube watch URLs to embed URLs
const toEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  return url;
};

// Count total lessons across all modules
const totalLessons = (modules) =>
  modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);

const completedCount = (modules, completed) =>
  modules.reduce(
    (acc, m) =>
      acc + (m.lessons ? m.lessons.filter((l) => completed[l._id]).length : 0),
    0
  );

// ─── Component ───────────────────────────────────────────────────────────────

const CoursePlayer = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completed, setCompleted] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab] = useState('notes'); // 'notes' | 'overview'

  // Fetch course
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getCourseContent(id);
        setCourse(data.data);
        const modules = data.data.modules || [];
        // Expand all modules by default
        const expanded = {};
        modules.forEach((m) => { expanded[m._id] = true; });
        setExpandedModules(expanded);
        // Load saved progress
        const savedProgress = loadProgress(id);
        setCompleted(savedProgress);
        // Set first lesson as active
        if (modules.length > 0 && modules[0].lessons?.length > 0) {
          setActiveLesson(modules[0].lessons[0]);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
          toast.error('You must be enrolled to access this course.');
          navigate(`/courses/${id}`);
        } else {
          toast.error('Failed to load course content.');
          navigate('/courses');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
    // eslint-disable-next-line
  }, [id, user]);

  const handleSelectLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
    setTab('notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleModule = useCallback((moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }, []);

  const markComplete = useCallback(() => {
    if (!activeLesson) return;
    const updated = { ...completed, [activeLesson._id]: true };
    setCompleted(updated);
    saveProgress(id, updated);
    toast.success('Lesson marked as complete!');
  }, [activeLesson, completed, id]);

  // Navigate to next lesson
  const goToNext = useCallback(() => {
    if (!course || !activeLesson) return;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIdx = allLessons.findIndex((l) => l._id === activeLesson._id);
    if (currentIdx < allLessons.length - 1) {
      handleSelectLesson(allLessons[currentIdx + 1]);
    }
  }, [course, activeLesson, handleSelectLesson]);

  // Navigate to prev lesson
  const goToPrev = useCallback(() => {
    if (!course || !activeLesson) return;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIdx = allLessons.findIndex((l) => l._id === activeLesson._id);
    if (currentIdx > 0) {
      handleSelectLesson(allLessons[currentIdx - 1]);
    }
  }, [course, activeLesson, handleSelectLesson]);

  if (loading) {
    return (
      <div className="player-loading">
        <div className="spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) return null;

  const modules = course.modules || [];
  const total = totalLessons(modules);
  const done = completedCount(modules, completed);
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIdx = activeLesson ? allLessons.findIndex((l) => l._id === activeLesson._id) : -1;
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allLessons.length - 1;
  const embedUrl = activeLesson ? toEmbedUrl(activeLesson.videoUrl) : null;
  const videoType = activeLesson ? classifyVideo(activeLesson.videoUrl) : null;
  const isCompleted = activeLesson ? !!completed[activeLesson._id] : false;

  return (
    <div className="player-root">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="player-topbar">
        <div className="player-topbar-left">
          <button className="player-back-btn" onClick={() => navigate('/courses/my')}>
            ← Back
          </button>
          <span className="player-course-title">{course.title}</span>
        </div>
        <div className="player-topbar-right">
          <div className="player-progress-mini">
            <div className="player-progress-bar">
              <div className="player-progress-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
            <span className="player-progress-label">{progressPct}% complete</span>
          </div>
          <button
            className="player-sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? '✕ Course Content' : '☰ Course Content'}
          </button>
        </div>
      </header>

      {/* ── Main Layout ─────────────────────────────────────────── */}
      <div className={`player-body ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        {/* ── Left: Lesson View ───────────────────────────────────── */}
        <main className="player-main">
          {activeLesson ? (
            <>
              {/* Video */}
              {videoType === 'youtube' && embedUrl && (
                <div className="player-video-wrap">
                  <iframe
                    src={embedUrl}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              {(videoType === 'local' || videoType === 'external') && activeLesson.videoUrl && (
                <div className="player-video-wrap">
                  <video
                    src={activeLesson.videoUrl}
                    controls
                    style={{ width: '100%', height: '100%', background: '#000' }}
                    title={activeLesson.title}
                  />
                </div>
              )}

              {/* Lesson Header */}
              <div className="player-lesson-header">
                <div className="player-lesson-meta">
                  {activeLesson.duration && (
                    <span className="lesson-duration-tag">{activeLesson.duration}</span>
                  )}
                  {isCompleted && <span className="lesson-done-tag">Completed</span>}
                </div>
                <h1 className="player-lesson-title">{activeLesson.title}</h1>

                {/* Actions */}
                <div className="player-lesson-actions">
                  <button
                    className="btn-player-prev"
                    onClick={goToPrev}
                    disabled={!hasPrev}
                  >
                    ← Previous
                  </button>
                  {!isCompleted && (
                    <button className="btn-player-complete" onClick={markComplete}>
                      Mark Complete
                    </button>
                  )}
                  <button
                    className="btn-player-next"
                    onClick={goToNext}
                    disabled={!hasNext}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="player-tabs">
                <button
                  className={`player-tab ${tab === 'notes' ? 'active' : ''}`}
                  onClick={() => setTab('notes')}
                >
                  Lesson Notes
                </button>
                <button
                  className={`player-tab ${tab === 'overview' ? 'active' : ''}`}
                  onClick={() => setTab('overview')}
                >
                  Course Overview
                </button>
              </div>

              {/* Tab Content */}
              <div className="player-tab-content">
                {tab === 'notes' && (
                  <div className="player-notes">
                    {activeLesson.content ? (
                      <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                    ) : (
                      <p className="no-notes">No notes for this lesson yet.</p>
                    )}
                  </div>
                )}
                {tab === 'overview' && (
                  <div className="player-overview">
                    <h2>{course.title}</h2>
                    <p>{course.description}</p>
                    {course.topics && course.topics.length > 0 && (
                      <>
                        <h3>What You'll Learn</h3>
                        <ul className="overview-topics">
                          {course.topics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {course.mentor && (
                      <>
                        <h3>Your Instructor</h3>
                        <div className="overview-instructor">
                          <img
                            src={course.mentor.profilePicture || '/default-avatar.png'}
                            alt={course.mentor.name}
                          />
                          <div>
                            <strong>{course.mentor.name}</strong>
                            {course.mentor.location && <p>{course.mentor.location}</p>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="player-empty">
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </main>

        {/* ── Right: Sidebar ──────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="player-sidebar">
            <div className="sidebar-header">
              <span>Course Content</span>
              <small>{done}/{total} lessons completed</small>
            </div>

            {modules.map((mod, mIdx) => (
              <div key={mod._id || mIdx} className="sidebar-module">
                <button
                  className="sidebar-module-header"
                  onClick={() => toggleModule(mod._id || mIdx)}
                >
                  <div className="sidebar-module-info">
                    <span className="sidebar-module-title">{mod.title}</span>
                    <span className="sidebar-module-count">
                      {mod.lessons?.length || 0} lessons
                    </span>
                  </div>
                  <span className="sidebar-chevron">
                    {expandedModules[mod._id || mIdx] ? '▲' : '▼'}
                  </span>
                </button>

                {expandedModules[mod._id || mIdx] && (
                  <ul className="sidebar-lessons">
                    {(mod.lessons || []).map((lesson, lIdx) => {
                      const isActive = activeLesson?._id === lesson._id;
                      const isDone = !!completed[lesson._id];
                      return (
                        <li
                          key={lesson._id || lIdx}
                          className={`sidebar-lesson ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                          onClick={() => handleSelectLesson(lesson)}
                        >
                          <span className="sidebar-lesson-icon">
                            {isDone ? (
                              <span className="icon-check">✓</span>
                            ) : isActive ? (
                              <span className="icon-play">▶</span>
                            ) : (
                              <span className="icon-circle">○</span>
                            )}
                          </span>
                          <span className="sidebar-lesson-title">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="sidebar-lesson-dur">{lesson.duration}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
