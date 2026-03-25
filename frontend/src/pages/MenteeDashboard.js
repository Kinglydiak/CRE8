import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../services/bookingService';
import AuthContext from '../context/AuthContext';
import { MdCalendarToday, MdPeople, MdCheckCircle, MdArrowForward, MdBook } from 'react-icons/md';
import './Dashboard.css';

const DAYS = ['S','M','T','W','T','F','S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function MiniCalendar({ bookingDates }) {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const first = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);
  const hasSession = (d) => d && bookingDates.some(bd => {
    const dt = new Date(bd);
    return dt.getFullYear() === cur.y && dt.getMonth() === cur.m && dt.getDate() === d;
  });
  return (
    <div className="db-mini-cal">
      <div className="db-cal-header">
        <button onClick={() => setCur(c => { const d = new Date(c.y, c.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
        <span>{MONTHS[cur.m]} {cur.y}</span>
        <button onClick={() => setCur(c => { const d = new Date(c.y, c.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
      </div>
      <div className="db-cal-grid">
        {DAYS.map((d, i) => <div key={i} className="db-cal-dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`db-cal-day${d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear() ? ' today' : ''}${hasSession(d) ? ' has-session' : ''}${!d ? ' empty' : ''}`}>{d || ''}</div>
        ))}
      </div>
    </div>
  );
}

function BookingChart({ bookings }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTHS[d.getMonth()].slice(0, 3), y: d.getFullYear(), m: d.getMonth(), total: 0, completed: 0 };
  });
  bookings.forEach(b => {
    const d = new Date(b.sessionDate);
    const idx = months.findIndex(mo => mo.y === d.getFullYear() && mo.m === d.getMonth());
    if (idx !== -1) { months[idx].total++; if (b.status === 'completed') months[idx].completed++; }
  });
  const W = 540, H = 140, PAD = { t: 10, r: 20, b: 30, l: 30 };
  const gW = W - PAD.l - PAD.r, gH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...months.map(m => m.total), 1);
  const xOf = (i) => PAD.l + (i / (months.length - 1)) * gW;
  const yOf = (v) => PAD.t + gH - (v / maxVal) * gH;
  const linePath = (key) => months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(m[key])}`).join(' ');
  const areaPath = (key) => `${linePath(key)} L ${xOf(months.length - 1)} ${PAD.t + gH} L ${xOf(0)} ${PAD.t + gH} Z`;
  return (
    <div className="db-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="db-chart-svg">
        <defs>
          <linearGradient id="g-total-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" /></linearGradient>
          <linearGradient id="g-comp-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.2" /><stop offset="100%" stopColor="#10b981" stopOpacity="0.02" /></linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => <line key={i} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + gH * (1 - f)} y2={PAD.t + gH * (1 - f)} stroke="#e5e7eb" strokeWidth="1" />)}
        <path d={areaPath('total')} fill="url(#g-total-m)" />
        <path d={areaPath('completed')} fill="url(#g-comp-m)" />
        <path d={linePath('total')} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={linePath('completed')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {months.map((m, i) => <g key={i}><circle cx={xOf(i)} cy={yOf(m.total)} r="4" fill="#6366f1" /><circle cx={xOf(i)} cy={yOf(m.completed)} r="4" fill="#10b981" /></g>)}
        {months.map((m, i) => <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize="10">{m.label}</text>)}
      </svg>
      <div className="db-chart-legend">
        <span className="db-legend-dot" style={{ background: '#6366f1' }} /> Total Sessions
        <span className="db-legend-dot" style={{ background: '#10b981', marginLeft: 16 }} /> Completed
      </div>
    </div>
  );
}

const MenteeDashboard = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const data = await getBookings();
      const list = data.data || [];
      setAllBookings(list);
      const now = new Date();
      setStats({
        total: list.length,
        upcoming: list.filter(b => new Date(b.sessionDate) > now && b.status !== 'cancelled').length,
        completed: list.filter(b => b.status === 'completed').length,
      });
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingToday = allBookings.filter(b => {
    const d = new Date(b.sessionDate);
    return d.toDateString() === now.toDateString() && b.status !== 'cancelled';
  });

  if (loading) return <div className="spinner" />;

  return (
    <div className="db-root">
      <div className="db-topbar">
        <div>
          <h1 className="db-page-title">Dashboard</h1>
          <p className="db-page-sub">Welcome back, {user?.name}</p>
        </div>
        <Link to="/mentors" className="btn btn-primary btn-sm">Find Mentors</Link>
      </div>

      <div className="db-content">
        <div className="db-left">
          {/* Banner */}
          <div className="db-banner">
            <div className="db-banner-icon"><MdCalendarToday /></div>
            <div className="db-banner-body">
              <div className="db-banner-num">{stats.upcoming}</div>
              <div>
                <p className="db-banner-label">Upcoming Sessions</p>
                <p className="db-banner-period">Scheduled</p>
              </div>
            </div>
            <Link to="/bookings" className="db-banner-btn">See Bookings <MdArrowForward /></Link>
          </div>

          {/* Stats */}
          <div className="db-stats-row">
            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#ede9fe', color: '#6366f1' }}><MdPeople /></div>
              <div>
                <div className="db-stat-num">{stats.total}</div>
                <div className="db-stat-label">Total Bookings</div>
              </div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}><MdCalendarToday /></div>
              <div>
                <div className="db-stat-num">{stats.upcoming}</div>
                <div className="db-stat-label">Upcoming</div>
              </div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><MdCheckCircle /></div>
              <div>
                <div className="db-stat-num">{stats.completed}</div>
                <div className="db-stat-label">Completed</div>
              </div>
              {stats.total > 0 && (
                <span className="db-stat-badge success">{Math.round((stats.completed / stats.total) * 100)}%</span>
              )}
            </div>
            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><MdBook /></div>
              <div>
                <div className="db-stat-num">
                  <Link to="/courses/my" style={{ color: 'inherit', textDecoration: 'none' }}>Courses</Link>
                </div>
                <div className="db-stat-label">My Learning</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Session Activity</h3>
              <div className="db-chart-period">Last 6 months</div>
            </div>
            <BookingChart bookings={allBookings} />
          </div>

          {/* Recent bookings */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Recent Bookings</h3>
              <Link to="/bookings" className="db-view-all">View All →</Link>
            </div>
            {allBookings.length === 0 ? (
              <div className="db-empty-msg">
                No bookings yet. <Link to="/mentors" style={{ color: '#6366f1' }}>Find a Mentor</Link>
              </div>
            ) : (
              <div className="db-table">
                {allBookings.slice(0, 6).map(b => (
                  <div key={b._id} className="db-table-row">
                    <img src={b.mentor?.profilePicture || '/default-avatar.png'} alt={b.mentor?.name} className="db-avatar" />
                    <div className="db-row-info">
                      <div className="db-row-name">{b.mentor?.name || 'Mentor'}</div>
                      <div className="db-row-sub">{b.topic}</div>
                    </div>
                    <div className="db-row-date">{new Date(b.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <span className={`db-status-badge db-status-${b.status}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="db-right">
          <MiniCalendar bookingDates={allBookings.map(b => b.sessionDate)} />

          <div className="db-card" style={{ marginTop: 16 }}>
            <div className="db-card-header">
              <h3>Today's Schedule</h3>
              <span className="db-today-count">{upcomingToday.length} sessions</span>
            </div>
            {upcomingToday.length === 0 ? (
              <div className="db-schedule-empty">
                <p>No sessions today</p>
                <Link to="/mentors" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Book a Session</Link>
              </div>
            ) : (
              <div className="db-schedule-list">
                {upcomingToday.map((b, i) => (
                  <div key={b._id} className={`db-schedule-item color-${i % 4}`}>
                    <div className="db-sched-time">{new Date(b.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="db-sched-body">
                      <div className="db-sched-name">{b.mentor?.name || 'Mentor'}</div>
                      <div className="db-sched-topic">{b.topic}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="db-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 12, fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>Quick Actions</h3>
            <div className="db-quick-links">
              {[
                { to: '/mentors', label: 'Find a Mentor' },
                { to: '/bookings', label: 'My Bookings' },
                { to: '/courses', label: 'Browse Courses' },
                { to: '/courses/my', label: 'My Courses' },
                { to: '/messages', label: 'Messages' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="db-quick-link">{label} →</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenteeDashboard;
