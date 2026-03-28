import React, { useState, useEffect } from 'react';
import {
  getAllUsers, verifyMentor, deleteUser, getAnalytics,
  getAllCoursesAdmin, deleteCourseAdmin,
  getAllResourcesAdmin, deleteResourceAdmin
} from '../services/adminService';
import {
  MdDashboard, MdPeople, MdBook, MdFolder,
  MdVerified, MdDelete, MdSearch, MdAttachMoney,
  MdCalendarToday, MdCheckCircle, MdTrendingUp, MdSchool
} from 'react-icons/md';
import { toast } from 'react-toastify';
import './Dashboard.css';
import './AdminDashboard.css';

const TABS = [
  { key: 'overview',   label: 'Overview',   icon: MdDashboard },
  { key: 'users',      label: 'Users',       icon: MdPeople },
  { key: 'courses',    label: 'Courses',     icon: MdBook },
  { key: 'resources',  label: 'Resources',   icon: MdFolder },
];

/* ── Confirm-delete hook ─────────────────────────────────── */
function useConfirm() {
  const [pending, setPending] = useState(null);
  const ask = (id) => setPending(id);
  const cancel = () => setPending(null);
  return { pending, ask, cancel };
}

/* ── Stat card ───────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="ad-stat-card">
    <div className="ad-stat-icon" style={{ background: color + '18', color }}><Icon size={22} /></div>
    <div>
      <p className="ad-stat-label">{label}</p>
      <p className="ad-stat-value">{value ?? '—'}</p>
    </div>
  </div>
);

/* ── Delete button with inline confirm ───────────────────── */
const DeleteBtn = ({ id, pending, ask, cancel, onConfirm }) => (
  pending === id ? (
    <span className="ad-confirm-row">
      <span>Delete?</span>
      <button className="ad-btn-yes" onClick={() => onConfirm(id)}>Yes</button>
      <button className="ad-btn-no" onClick={cancel}>No</button>
    </span>
  ) : (
    <button className="ad-btn-icon ad-btn-delete" onClick={() => ask(id)} title="Delete">
      <MdDelete size={16} />
    </button>
  )
);

/* ════════════════════════════════════════════════════════════
   OVERVIEW TAB
════════════════════════════════════════════════════════════ */
const OverviewTab = ({ data }) => {
  if (!data) return <div className="spinner" style={{ margin: '60px auto' }} />;
  const rate = data.totalBookings ? Math.round((data.completedBookings / data.totalBookings) * 100) : 0;
  return (
    <div className="ad-tab-content">
      <div className="ad-stats-grid">
        <StatCard icon={MdPeople}          label="Total Users"         value={data.totalUsers}        color="#6366f1" />
        <StatCard icon={MdSchool}          label="Mentors"             value={data.totalMentors}      color="#8b5cf6" />
        <StatCard icon={MdPeople}          label="Mentees"             value={data.totalMentees}      color="#3b82f6" />
        <StatCard icon={MdCalendarToday}   label="Total Bookings"      value={data.totalBookings}     color="#f59e0b" />
        <StatCard icon={MdCheckCircle}     label="Completed Sessions"  value={data.completedBookings} color="#10b981" />
        <StatCard icon={MdAttachMoney}     label="Revenue (RWF)"       value={data.totalRevenue?.toLocaleString()} color="#ec4899" />
      </div>

      <div className="ad-card">
        <div className="ad-card-header"><MdTrendingUp size={16} /> Session Completion Rate <span className="ad-rate">{rate}%</span></div>
        <div className="ad-progress-track"><div className="ad-progress-fill" style={{ width: `${rate}%` }} /></div>
        <p className="ad-progress-sub">{data.completedBookings} of {data.totalBookings} bookings completed</p>
      </div>

      <div className="ad-two-col">
        <div className="ad-card">
          <h3 className="ad-section-title">Top Mentors by Rating</h3>
          {!data.topMentors?.length
            ? <p className="ad-empty">No mentors yet</p>
            : <table className="ad-table">
                <thead><tr><th>#</th><th>Name</th><th>Rating</th><th>Sessions</th></tr></thead>
                <tbody>
                  {data.topMentors.map((m, i) => (
                    <tr key={m._id}>
                      <td className="ad-muted">{i + 1}</td>
                      <td><div className="ad-user-cell"><div className="ad-avatar">{m.name?.charAt(0).toUpperCase()}</div><div><p className="ad-name">{m.name}</p><p className="ad-sub">{m.email}</p></div></div></td>
                      <td><span className="ad-rating">★ {(m.rating || 0).toFixed(1)}</span></td>
                      <td className="ad-muted">{m.completedSessions || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
        <div className="ad-card">
          <h3 className="ad-section-title">Recent Bookings</h3>
          {!data.recentBookings?.length
            ? <p className="ad-empty">No bookings yet</p>
            : <div className="ad-booking-list">
                {data.recentBookings.map(b => (
                  <div key={b._id} className="ad-booking-row">
                    <div>
                      <p className="ad-name">{b.mentee?.name || '—'} → {b.mentor?.name || '—'}</p>
                      <p className="ad-sub">{new Date(b.sessionDate || b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`ad-badge ad-status-${b.status}`}>{b.status}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   USERS TAB
════════════════════════════════════════════════════════════ */
const ROLE_FILTERS = ['all', 'mentee', 'mentor', 'admin'];

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const del = useConfirm();

  useEffect(() => {
    getAllUsers()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id) => {
    try { await verifyMentor(id); setUsers(p => p.map(u => u._id === id ? { ...u, isVerified: true } : u)); toast.success('Mentor verified'); }
    catch { toast.error('Verification failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteUser(id); setUsers(p => p.filter(u => u._id !== id)); toast.success('User deleted'); }
    catch { toast.error('Failed to delete user'); }
    finally { del.cancel(); }
  };

  const visible = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) { const q = search.toLowerCase(); return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q); }
    return true;
  });

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div className="ad-tab-content">
      <div className="ad-filters">
        <div className="ad-search"><MdSearch className="ad-search-icon" /><input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="ad-role-tabs">
          {ROLE_FILTERS.map(r => <button key={r} className={`ad-role-tab${roleFilter === r ? ' active' : ''}`} onClick={() => setRoleFilter(r)}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>)}
        </div>
      </div>
      {!visible.length ? <p className="ad-empty">No users found</p> : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {visible.map(u => (
                <tr key={u._id}>
                  <td><div className="ad-user-cell"><div className="ad-avatar">{u.name?.charAt(0).toUpperCase()}</div><span>{u.name}</span></div></td>
                  <td className="ad-muted">{u.email}</td>
                  <td><span className={`ad-badge ad-role-${u.role}`}>{u.role}</span></td>
                  <td>
                    {u.role === 'mentor'
                      ? <span className={`ad-badge ${u.isVerified ? 'ad-verified' : 'ad-pending'}`}>{u.isVerified ? 'Verified' : 'Pending'}</span>
                      : <span className="ad-badge ad-active">Active</span>}
                  </td>
                  <td className="ad-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="ad-actions">
                      {u.role === 'mentor' && !u.isVerified && (
                        <button className="ad-btn-verify" onClick={() => handleVerify(u._id)}><MdVerified size={14} /> Verify</button>
                      )}
                      {u.role !== 'admin' && <DeleteBtn id={u._id} pending={del.pending} ask={del.ask} cancel={del.cancel} onConfirm={handleDelete} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   COURSES TAB
════════════════════════════════════════════════════════════ */
const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const del = useConfirm();

  useEffect(() => {
    getAllCoursesAdmin()
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try { await deleteCourseAdmin(id); setCourses(p => p.filter(c => c._id !== id)); toast.success('Course deleted'); }
    catch { toast.error('Failed to delete course'); }
    finally { del.cancel(); }
  };

  const visible = courses.filter(c => !search.trim() || c.title?.toLowerCase().includes(search.toLowerCase()) || c.mentor?.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div className="ad-tab-content">
      <div className="ad-filters">
        <div className="ad-search"><MdSearch className="ad-search-icon" /><input placeholder="Search by title or mentor…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <span className="ad-count">{courses.length} courses</span>
      </div>
      {!visible.length ? <p className="ad-empty">No courses found</p> : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>Title</th><th>Mentor</th><th>Price</th><th>Level</th><th>Status</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {visible.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="ad-course-cell">
                      {c.thumbnail && <img src={c.thumbnail} alt="" className="ad-thumb" />}
                      <div><p className="ad-name">{c.title}</p><p className="ad-sub">{c.category}</p></div>
                    </div>
                  </td>
                  <td className="ad-muted">{c.mentor?.name || '—'}</td>
                  <td>{c.price === 0 ? <span className="ad-badge ad-active">Free</span> : `${c.price?.toLocaleString()} ${c.currency || 'RWF'}`}</td>
                  <td className="ad-muted">{c.level || '—'}</td>
                  <td><span className={`ad-badge ${c.isActive !== false ? 'ad-verified' : 'ad-pending'}`}>{c.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                  <td className="ad-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td><DeleteBtn id={c._id} pending={del.pending} ask={del.ask} cancel={del.cancel} onConfirm={handleDelete} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   RESOURCES TAB
════════════════════════════════════════════════════════════ */
const TYPE_COLORS = { document: '#3b82f6', video: '#8b5cf6', audio: '#f59e0b', pdf: '#ef4444', link: '#10b981', other: '#6b7280' };

const ResourcesTab = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const del = useConfirm();

  useEffect(() => {
    getAllResourcesAdmin()
      .then(r => setResources(r.data))
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try { await deleteResourceAdmin(id); setResources(p => p.filter(r => r._id !== id)); toast.success('Resource deleted'); }
    catch { toast.error('Failed to delete resource'); }
    finally { del.cancel(); }
  };

  const visible = resources.filter(r => !search.trim() || r.title?.toLowerCase().includes(search.toLowerCase()) || r.mentor?.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="spinner" style={{ margin: '60px auto' }} />;

  return (
    <div className="ad-tab-content">
      <div className="ad-filters">
        <div className="ad-search"><MdSearch className="ad-search-icon" /><input placeholder="Search by title or mentor…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <span className="ad-count">{resources.length} resources</span>
      </div>
      {!visible.length ? <p className="ad-empty">No resources found</p> : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th>Title</th><th>Mentor</th><th>Type</th><th>Access</th><th>Downloads</th><th>Uploaded</th><th></th></tr></thead>
            <tbody>
              {visible.map(r => (
                <tr key={r._id}>
                  <td><p className="ad-name">{r.title}</p><p className="ad-sub">{r.category}</p></td>
                  <td className="ad-muted">{r.mentor?.name || '—'}</td>
                  <td><span className="ad-type-dot" style={{ background: TYPE_COLORS[r.fileType] || '#6b7280' }}>{r.fileType}</span></td>
                  <td className="ad-muted" style={{ fontSize: '0.8rem' }}>{r.accessLevel?.replace('_', ' ')}</td>
                  <td className="ad-muted">{r.downloads || 0}</td>
                  <td className="ad-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><DeleteBtn id={r._id} pending={del.pending} ask={del.ask} cancel={del.cancel} onConfirm={handleDelete} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then(r => setAnalytics(r.data))
      .catch(() => toast.error('Failed to load analytics'));
  }, []);

  return (
    <div className="db-root">
      <div className="db-topbar">
        <div>
          <h1 className="db-page-title">Admin Dashboard</h1>
          <p className="db-page-sub">Manage users, courses, and resources across the platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ad-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`ad-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview'  && <OverviewTab data={analytics} />}
      {tab === 'users'     && <UsersTab />}
      {tab === 'courses'   && <CoursesTab />}
      {tab === 'resources' && <ResourcesTab />}
    </div>
  );
};

export default AdminDashboard;
