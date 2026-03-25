import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import {
  getCourse,
  createCourse,
  updateCourse,
  uploadCourseThumbnail,
  uploadCourseVideo
} from '../services/courseService';
import './MentorCourseEditor.css';

const CATEGORIES = [
  'Music Production', 'Graphic Design', 'Photography', 'Videography',
  'Writing', 'Coding', 'Business', 'Marketing', 'Art & Illustration',
  'Film & Animation', 'Fashion', 'Cooking', 'Fitness', 'Other'
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const CURRENCIES = ['RWF', 'USD', 'EUR', 'XOF', 'NGN', 'KES', 'GHS'];

const tmpId = () => Math.random().toString(36).slice(2);

const emptyLesson = (order = 0) => ({
  _tmpId: tmpId(), title: 'New Lesson', videoUrl: '',
  content: '', duration: '', isFreePreview: false, order
});

const emptyModule = (order = 0) => ({
  _tmpId: tmpId(), title: 'New Module', description: '', order, lessons: []
});

const MentorCourseEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({
    title: '', description: '', price: 0, currency: 'RWF',
    category: '', level: 'All Levels', duration: '', topics: '',
    thumbnail: '', isActive: true
  });
  const [modules, setModules] = useState([]);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(null);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoMode, setVideoMode] = useState('url');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isEditing) loadCourse();
    // eslint-disable-next-line
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const res = await getCourse(id);
      const c = res.data;
      setForm({
        title: c.title || '',
        description: c.description || '',
        price: c.price || 0,
        currency: c.currency || 'RWF',
        category: c.category || '',
        level: c.level || 'All Levels',
        duration: c.duration || '',
        topics: Array.isArray(c.topics) ? c.topics.join(', ') : '',
        thumbnail: c.thumbnail || '',
        isActive: c.isActive !== false
      });
      setModules((c.modules || []).map(m => ({
        ...m,
        _tmpId: m._id?.toString() || tmpId(),
        lessons: (m.lessons || []).map(l => ({
          ...l,
          _tmpId: l._id?.toString() || tmpId()
        }))
      })));
    } catch (err) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, val) => setForm(f => ({ ...f, [field]: val }));

  // ── Module operations ──────────────────────────────────────────────────
  const addModule = () => {
    const mod = emptyModule(modules.length);
    setModules(m => [...m, mod]);
    setSelectedModuleIdx(modules.length);
    setSelectedLessonIdx(null);
  };

  const updateModuleField = (mi, field, val) =>
    setModules(ms => ms.map((m, i) => i === mi ? { ...m, [field]: val } : m));

  const deleteModule = (mi) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    setModules(ms => ms.filter((_, i) => i !== mi));
    setSelectedModuleIdx(null);
    setSelectedLessonIdx(null);
  };

  const moveModule = (mi, dir) => {
    setModules(ms => {
      const arr = [...ms];
      const target = mi + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[mi], arr[target]] = [arr[target], arr[mi]];
      return arr.map((m, i) => ({ ...m, order: i }));
    });
    setSelectedModuleIdx(mi + dir);
  };

  // ── Lesson operations ──────────────────────────────────────────────────
  const addLesson = (mi) => {
    const lesson = emptyLesson(modules[mi].lessons.length);
    setModules(ms => ms.map((m, i) => i === mi ? { ...m, lessons: [...m.lessons, lesson] } : m));
    setSelectedModuleIdx(mi);
    setSelectedLessonIdx(modules[mi].lessons.length);
  };

  const updateLessonField = (mi, li, field, val) =>
    setModules(ms => ms.map((m, i) => i !== mi ? m : {
      ...m,
      lessons: m.lessons.map((l, j) => j === li ? { ...l, [field]: val } : l)
    }));

  const deleteLesson = (mi, li) => {
    setModules(ms => ms.map((m, i) => i !== mi ? m : {
      ...m, lessons: m.lessons.filter((_, j) => j !== li)
    }));
    setSelectedLessonIdx(null);
  };

  const moveLesson = (mi, li, dir) => {
    setModules(ms => ms.map((m, i) => {
      if (i !== mi) return m;
      const arr = [...m.lessons];
      const target = li + dir;
      if (target < 0 || target >= arr.length) return m;
      [arr[li], arr[target]] = [arr[target], arr[li]];
      return { ...m, lessons: arr.map((l, j) => ({ ...l, order: j })) };
    }));
    setSelectedLessonIdx(li + dir);
  };

  // ── Upload thumbnail ───────────────────────────────────────────────────
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const res = await uploadCourseThumbnail(fd);
      setField('thumbnail', res.url);
      toast.success('Thumbnail uploaded');
    } catch {
      toast.error('Thumbnail upload failed');
    } finally {
      setUploadingThumb(false);
      e.target.value = '';
    }
  };

  // ── Upload video for selected lesson ──────────────────────────────────
  const handleVideoUpload = async (e, mi, li) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('video', file);
      const res = await uploadCourseVideo(fd, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(pct);
      });
      updateLessonField(mi, li, 'videoUrl', res.url);
      toast.success('Video uploaded');
    } catch {
      toast.error('Video upload failed');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Course title is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
        modules: modules.map((m, mi) => ({
          title: m.title,
          description: m.description || '',
          order: mi,
          lessons: m.lessons.map((l, li) => ({
            title: l.title,
            videoUrl: l.videoUrl || '',
            content: l.content || '',
            duration: l.duration || '',
            isFreePreview: !!l.isFreePreview,
            order: li
          }))
        }))
      };

      if (isEditing) {
        await updateCourse(id, payload);
        toast.success('Course saved!');
      } else {
        const res = await createCourse(payload);
        toast.success('Course created!');
        navigate(`/mentor/courses/${res.data._id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const activeModule = selectedModuleIdx !== null ? modules[selectedModuleIdx] : null;
  const activeLesson =
    selectedModuleIdx !== null && selectedLessonIdx !== null
      ? modules[selectedModuleIdx]?.lessons[selectedLessonIdx]
      : null;

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  if (loading) return <div className="spinner" />;

  return (
    <div className="mce-root">
      {/* Top bar */}
      <div className="mce-topbar">
        <Link to="/mentor/courses" className="mce-back">← My Courses</Link>
        <h1 className="mce-title">{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
        <div className="mce-topbar-actions">
          {isEditing && (
            <a href={`/courses/${id}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
              Preview Page
            </a>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Course')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mce-tabs">
        <button className={`mce-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
          Course Info
        </button>
        <button className={`mce-tab ${tab === 'curriculum' ? 'active' : ''}`} onClick={() => setTab('curriculum')}>
          Curriculum
          {(modules.length > 0 || totalLessons > 0) && (
            <span className="mce-tab-badge">{modules.length}M · {totalLessons}L</span>
          )}
        </button>
      </div>

      <div className="mce-body">

        {/* ══════════════════ COURSE INFO TAB ══════════════════ */}
        {tab === 'info' && (
          <div className="mce-info-form">

            <div className="mce-field">
              <label>Course Title *</label>
              <input
                type="text"
                placeholder="e.g. How to Make Music from Scratch"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
              />
            </div>

            <div className="mce-field">
              <label>Description</label>
              <textarea
                rows={5}
                placeholder="What will students learn? Who is this course for? What makes it unique?"
                value={form.description}
                onChange={e => setField('description', e.target.value)}
              />
            </div>

            <div className="mce-row">
              <div className="mce-field">
                <label>Category</label>
                <select value={form.category} onChange={e => setField('category', e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mce-field">
                <label>Level</label>
                <select value={form.level} onChange={e => setField('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="mce-row">
              <div className="mce-field">
                <label>Price</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e => setField('price', Number(e.target.value))}
                />
              </div>
              <div className="mce-field">
                <label>Currency</label>
                <select value={form.currency} onChange={e => setField('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mce-field mce-field-sm">
                <label>Duration</label>
                <input
                  type="text"
                  placeholder='e.g. "6 hours"'
                  value={form.duration}
                  onChange={e => setField('duration', e.target.value)}
                />
              </div>
            </div>

            <div className="mce-field">
              <label>Topics / Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="Music Theory, Beat Making, Mixing, Mastering"
                value={form.topics}
                onChange={e => setField('topics', e.target.value)}
              />
              <p className="mce-hint">These appear as tags on the course page and help with search.</p>
            </div>

            <div className="mce-field">
              <label>Course Thumbnail</label>
              <div className="mce-thumbnail-group">
                {form.thumbnail && (
                  <img src={form.thumbnail} alt="thumbnail preview" className="mce-thumb-preview" />
                )}
                <div className="mce-upload-area">
                  <input
                    type="text"
                    placeholder="Paste an image URL, or upload a file below"
                    value={form.thumbnail}
                    onChange={e => setField('thumbnail', e.target.value)}
                  />
                  <label className="mce-file-btn">
                    {uploadingThumb ? 'Uploading…' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumb}
                      hidden
                    />
                  </label>
                  <p className="mce-hint">JPG, PNG, WebP · Max 10 MB · Recommended: 1280×720px</p>
                </div>
              </div>
            </div>

            <div className="mce-field">
              <label className="mce-toggle-label">
                <span>Visibility</span>
                <label className="mce-toggle">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setField('isActive', e.target.checked)}
                  />
                  <span className="mce-toggle-slider"></span>
                </label>
                <span className={`mce-status-badge ${form.isActive ? 'active' : 'draft'}`}>
                  {form.isActive ? 'Published — visible in marketplace' : 'Draft — hidden from students'}
                </span>
              </label>
            </div>

          </div>
        )}

        {/* ══════════════════ CURRICULUM TAB ══════════════════ */}
        {tab === 'curriculum' && (
          <div className="mce-curriculum">

            {/* Left: module/lesson tree */}
            <div className="mce-module-tree">
              <div className="mce-tree-header">
                <span>Course Structure</span>
                <button className="mce-add-module-btn" onClick={addModule}>+ Module</button>
              </div>

              {modules.length === 0 && (
                <div className="mce-empty-tree">
                  <p>No modules yet.</p>
                  <button onClick={addModule} className="btn btn-primary btn-sm">Add First Module</button>
                </div>
              )}

              {modules.map((mod, mi) => (
                <div
                  key={mod._tmpId}
                  className={`mce-module-item ${selectedModuleIdx === mi && selectedLessonIdx === null ? 'selected' : ''}`}
                >
                  <div
                    className="mce-module-header"
                    onClick={() => { setSelectedModuleIdx(mi); setSelectedLessonIdx(null); }}
                  >
                    <span className="mce-module-index">M{mi + 1}</span>
                    <span className="mce-module-name">{mod.title || 'Unnamed Module'}</span>
                    <div className="mce-item-actions">
                      <button onClick={e => { e.stopPropagation(); moveModule(mi, -1); }} title="Move up" disabled={mi === 0}>↑</button>
                      <button onClick={e => { e.stopPropagation(); moveModule(mi, 1); }} title="Move down" disabled={mi === modules.length - 1}>↓</button>
                      <button onClick={e => { e.stopPropagation(); deleteModule(mi); }} title="Delete" className="mce-delete-btn">✕</button>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="mce-lesson-list">
                    {mod.lessons.map((les, li) => (
                      <div
                        key={les._tmpId}
                        className={`mce-lesson-item ${selectedModuleIdx === mi && selectedLessonIdx === li ? 'selected' : ''}`}
                        onClick={() => { setSelectedModuleIdx(mi); setSelectedLessonIdx(li); }}
                      >
                        <span className="mce-lesson-index">{li + 1}</span>
                        <span className="mce-lesson-name">{les.title || 'Unnamed Lesson'}</span>
                        {les.isFreePreview && <span className="mce-preview-badge">Free</span>}
                        {les.videoUrl && <span className="mce-has-video-dot" title="Has video">▶</span>}
                        <div className="mce-item-actions">
                          <button onClick={e => { e.stopPropagation(); moveLesson(mi, li, -1); }} disabled={li === 0}>↑</button>
                          <button onClick={e => { e.stopPropagation(); moveLesson(mi, li, 1); }} disabled={li === mod.lessons.length - 1}>↓</button>
                          <button onClick={e => { e.stopPropagation(); deleteLesson(mi, li); }} className="mce-delete-btn">✕</button>
                        </div>
                      </div>
                    ))}
                    <button className="mce-add-lesson-btn" onClick={() => addLesson(mi)}>
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: editor panel */}
            <div className="mce-editor-panel">

              {/* Module editor */}
              {activeModule && selectedLessonIdx === null && (
                <div className="mce-module-editor">
                  <h3>Module {selectedModuleIdx + 1}</h3>
                  <div className="mce-field">
                    <label>Module Title</label>
                    <input
                      type="text"
                      value={activeModule.title}
                      onChange={e => updateModuleField(selectedModuleIdx, 'title', e.target.value)}
                      placeholder="e.g. Introduction to Music Theory"
                    />
                  </div>
                  <div className="mce-field">
                    <label>Module Description (optional)</label>
                    <textarea
                      rows={3}
                      value={activeModule.description}
                      onChange={e => updateModuleField(selectedModuleIdx, 'description', e.target.value)}
                      placeholder="Brief overview of what this module covers"
                    />
                  </div>
                  <p className="mce-hint">
                    This module has {activeModule.lessons.length} lesson{activeModule.lessons.length !== 1 ? 's' : ''}.
                    Click a lesson on the left to edit it, or click "+ Add Lesson" to add more.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => addLesson(selectedModuleIdx)}>
                    + Add Lesson to this Module
                  </button>
                </div>
              )}

              {/* Lesson editor */}
              {activeLesson && (
                <div className="mce-lesson-editor">
                  <h3>Lesson {selectedLessonIdx + 1} · Module {selectedModuleIdx + 1}</h3>

                  <div className="mce-row">
                    <div className="mce-field">
                      <label>Lesson Title</label>
                      <input
                        type="text"
                        value={activeLesson.title}
                        onChange={e => updateLessonField(selectedModuleIdx, selectedLessonIdx, 'title', e.target.value)}
                        placeholder="e.g. What is a music scale?"
                      />
                    </div>
                    <div className="mce-field mce-field-sm">
                      <label>Duration</label>
                      <input
                        type="text"
                        value={activeLesson.duration}
                        onChange={e => updateLessonField(selectedModuleIdx, selectedLessonIdx, 'duration', e.target.value)}
                        placeholder="e.g. 12 min"
                      />
                    </div>
                  </div>

                  <div className="mce-field">
                    <label className="mce-toggle-label">
                      Free Preview
                      <label className="mce-toggle">
                        <input
                          type="checkbox"
                          checked={activeLesson.isFreePreview}
                          onChange={e => updateLessonField(selectedModuleIdx, selectedLessonIdx, 'isFreePreview', e.target.checked)}
                        />
                        <span className="mce-toggle-slider"></span>
                      </label>
                      <span className="mce-hint">Free preview lessons are visible to non-enrolled users</span>
                    </label>
                  </div>

                  {/* Video section */}
                  <div className="mce-field">
                    <label>Video</label>
                    <div className="mce-video-toggle">
                      <button
                        className={`mce-vtab ${videoMode === 'url' ? 'active' : ''}`}
                        onClick={() => setVideoMode('url')}
                        type="button"
                      >
                        YouTube / URL
                      </button>
                      <button
                        className={`mce-vtab ${videoMode === 'file' ? 'active' : ''}`}
                        onClick={() => setVideoMode('file')}
                        type="button"
                      >
                        Upload File
                      </button>
                    </div>

                    {videoMode === 'url' && (
                      <div className="mce-video-url-group">
                        <input
                          type="text"
                          value={activeLesson.videoUrl}
                          onChange={e => updateLessonField(selectedModuleIdx, selectedLessonIdx, 'videoUrl', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or any video URL"
                        />
                        <p className="mce-hint">Paste a YouTube, Vimeo, or any direct video URL. It will be embedded in the player.</p>
                      </div>
                    )}

                    {videoMode === 'file' && (
                      <div className="mce-video-upload-group">
                        {activeLesson.videoUrl && !activeLesson.videoUrl.startsWith('http') && (
                          <div className="mce-current-video">
                            <p className="mce-hint">Current file: {activeLesson.videoUrl.split('/').pop()}</p>
                            <video
                              src={activeLesson.videoUrl}
                              controls
                              style={{ width: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 12 }}
                            />
                          </div>
                        )}
                        {uploadingVideo && (
                          <div className="mce-upload-progress">
                            <div className="mce-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            <span>{uploadProgress}%</span>
                          </div>
                        )}
                        <label className="mce-video-upload-btn">
                          {uploadingVideo ? `Uploading… ${uploadProgress}%` : 'Choose Video File'}
                          <input
                            type="file"
                            accept="video/*"
                            onChange={e => handleVideoUpload(e, selectedModuleIdx, selectedLessonIdx)}
                            disabled={uploadingVideo}
                            hidden
                          />
                        </label>
                        <p className="mce-hint">Supported: MP4, WebM, MOV, AVI · Max 500 MB</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="mce-field">
                    <label>Lesson Notes</label>
                    <p className="mce-hint" style={{ marginBottom: 8 }}>
                      Write notes in Markdown — supports **bold**, *italic*, ## headings, - lists, `code`, and more.
                    </p>
                    <textarea
                      className="mce-notes-editor"
                      rows={18}
                      value={activeLesson.content}
                      onChange={e => updateLessonField(selectedModuleIdx, selectedLessonIdx, 'content', e.target.value)}
                      placeholder={`## Key Concepts\n\nWrite your lesson notes here. Markdown is supported.\n\n- Point one\n- Point two\n\n**Important:** This content appears below the video in the course player.`}
                    />
                  </div>
                </div>
              )}

              {/* Empty states */}
              {!activeModule && !activeLesson && modules.length > 0 && (
                <div className="mce-empty-panel">
                  <p>Select a module or lesson from the left panel to edit it.</p>
                </div>
              )}

              {modules.length === 0 && (
                <div className="mce-empty-panel">
                  <h3>Build Your Curriculum</h3>
                  <p>
                    Organise your course into modules (sections) and lessons (videos + notes).
                    Students will work through them in order.
                  </p>
                  <button className="btn btn-primary" onClick={addModule}>
                    Add Your First Module
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorCourseEditor;
