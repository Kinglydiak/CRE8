import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBookings } from '../services/bookingService';
import { getWallet } from '../services/walletService';
import AuthContext from '../context/AuthContext';
import { MdCalendarToday, MdPeople, MdCheckCircle, MdAccountBalanceWallet, MdArrowForward, MdTrendingUp } from 'react-icons/md';
import './Dashboard.css';

/* ── Mini Calendar ────────────────────────────────────────── */
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function MiniCalendar({ bookingDates }) {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const first = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const hasSession = (d) => {
    if (!d) return false;
    return bookingDates.some(bd => {
      const dt = new Date(bd);
      return dt.getFullYear() === cur.y && dt.getMonth() === cur.m && dt.getDate() === d;
    });
  };

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
          <div
            key={i}
            className={`db-cal-day ${d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear() ? 'today' : ''} ${hasSession(d) ? 'has-session' : ''} ${!d ? 'empty' : ''}`}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SVG Sparkline Chart ──────────────────────────────────── */
function BookingChart({ bookings }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: MONTHS[d.getMonth()].slice(0, 3), y: d.getFullYear(), m: d.getMonth(), total: 0, completed: 0 };
  });

  bookings.forEach(b => {
    const d = new Date(b.sessionDate);
    const idx = months.findIndex(mo => mo.y === d.getFullYear() && mo.m === d.getMonth());
    if (idx !== -1) {
      months[idx].total++;
      if (b.status === 'completed') months[idx].completed++;
    }
  });

  const W = 540, H = 140, PAD = { t: 10, r: 20, b: 30, l: 30 };
  const gW = W - PAD.l - PAD.r;
  const gH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...months.map(m => m.total), 1);

  const xOf = (i) => PAD.l + (i / (months.length - 1)) * gW;
  const yOf = (v) => PAD.t + gH - (v / maxVal) * gH;

  const linePath = (key) =>
    months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(m[key])}`).join(' ');

  const areaPath = (key) =>
    `${linePath(key)} L ${xOf(months.length - 1)} ${PAD.t + gH} L ${xOf(0)} ${PAD.t + gH} Z`;

  return (
    <div className="db-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="db-chart-svg">
        <defs>
          <linearGradient id="g-total" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="g-completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <line key={i} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + gH * (1 - f)} y2={PAD.t + gH * (1 - f)} stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {/* Area fills */}
        <path d={areaPath('total')} fill="url(#g-total)" />
        <path d={areaPath('completed')} fill="url(#g-completed)" />
        {/* Lines */}
        <path d={linePath('total')} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={linePath('completed')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {months.map((m, i) => (
          <g key={i}>
            <circle cx={xOf(i)} cy={yOf(m.total)} r="4" fill="#6366f1" />
            <circle cx={xOf(i)} cy={yOf(m.completed)} r="4" fill="#10b981" />
          </g>
        ))}
        {/* X labels */}
        {months.map((m, i) => (
          <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize="10">{m.label}</text>
        ))}
      </svg>
      <div className="db-chart-legend">
        <span className="db-legend-dot" style={{ background: '#6366f1' }} /> Total Sessions
        <span className="db-legend-dot" style={{ background: '#10b981', marginLeft: 16 }} /> Completed
      </div>
    </div>
  );
}

/* ══════════════════ MAIN COMPONENT ══════════════════ */
const MentorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, pendingRequests: 0, completedSessions: 0, walletBalance: 0, walletCurrency: 'RWF' });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const [bookRes, walletRes] = await Promise.allSettled([getBookings(), getWallet()]);
      const list = bookRes.status === 'fulfilled' ? (bookRes.value?.data || []) : [];
      const wallet = walletRes.status === 'fulfilled' ? walletRes.value?.data : null;
      setAllBookings(list);
      setBookings(list.slice(0, 20));
      setStats({
        totalBookings: list.length,
        pendingRequests: list.filter(b => b.status === 'pending').length,
        completedSessions: list.filter(b => b.status === 'completed').length,
        walletBalance: wallet?.balance || 0,
        walletCurrency: wallet?.currency || 'RWF'
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
  const upcomingWeek = allBookings.filter(b => {
    const d = new Date(b.sessionDate);
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && b.status !== 'cancelled';
  });

  if (loading) return <div className="spinner" />;

  return (
    <div className="db-root">
      {/* ── Top bar ───────────────────────────────── */}
      <div className="db-topbar">
        <div>
          <h1 className="db-page-title">Dashboard</h1>
          <p className="db-page-sub">Welcome back, {user?.name}</p>
        </div>
        <Link to="/mentor/profile" className="btn btn-primary btn-sm">Edit Profile</Link>
      </div>

      <div className="db-content">
        {/* ── Left column ─────────────────────────── */}
        <div className="db-left">

          {/* Upcoming banner */}
          <div className="db-banner">
            <div className="db-banner-icon"><MdCalendarToday /></div>
            <div className="db-banner-body">
              <div className="db-banner-num">{upcomingWeek.length}</div>
              <div>
                <p className="db-banner-label">Upcoming Sessions</p>
                <p className="db-banner-period">This Week</p>
              </div>
            </div>
            <Link to="/mentor/bookings" className="db-banner-btn">See Schedule <MdArrowForward /></Link>
          </div>

          {/* Stats row */}
          <div className="db-stats-row">
            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#ede9fe', color: '#6366f1' }}><MdPeople /></div>
              <div>
                <div className="db-stat-num">{stats.totalBookings}</div>
                <div className="db-stat-label">Total Bookings</div>
              </div>
              {stats.pendingRequests > 0 && (
                <span className="db-stat-badge pending">{stats.pendingRequests} pending</span>
              )}
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><MdCheckCircle /></div>
              <div>
                <div className="db-stat-num">{stats.completedSessions}</div>
                <div className="db-stat-label">Completed</div>
              </div>
              {stats.totalBookings > 0 && (
                <span className="db-stat-badge success">
                  {Math.round((stats.completedSessions / stats.totalBookings) * 100)}%
                </span>
              )}
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><MdAccountBalanceWallet /></div>
              <div>
                <div className="db-stat-num" style={{ fontSize: '1.1rem' }}>
                  {stats.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="db-stat-label">Wallet · {stats.walletCurrency}</div>
              </div>
              <Link to="/mentor/wallet" className="db-stat-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                View
              </Link>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><MdTrendingUp /></div>
              <div>
                <div className="db-stat-num">{user?.rating ? user.rating.toFixed(1) : '—'}</div>
                <div className="db-stat-label">Rating</div>
              </div>
              {user?.totalRatings > 0 && (
                <span className="db-stat-badge" style={{ background: '#fce7f3', color: '#ec4899' }}>
                  {user.totalRatings} reviews
                </span>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Session Performance</h3>
              <div className="db-chart-period">Last 6 months</div>
            </div>
            <BookingChart bookings={allBookings} />
          </div>

          {/* Recent Sessions table */}
          <div className="db-card">
            <div className="db-card-header">
              <h3>Recent Sessions</h3>
              <Link to="/mentor/bookings" className="db-view-all">View All →</Link>
            </div>
            {bookings.length === 0 ? (
              <p className="db-empty-msg">No sessions yet — your bookings will appear here.</p>
            ) : (
              <div className="db-table">
                {bookings.slice(0, 6).map(b => (
                  <div key={b._id} className="db-table-row">
                    <img
                      src={b.mentee?.profilePicture || '/default-avatar.png'}
                      alt={b.mentee?.name}
                      className="db-avatar"
                    />
                    <div className="db-row-info">
                      <div className="db-row-name">{b.mentee?.name || 'Mentee'}</div>
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

        {/* ── Right panel ─────────────────────────── */}
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
                <Link to="/mentor/bookings" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>View All</Link>
              </div>
            ) : (
              <div className="db-schedule-list">
                {upcomingToday.map((b, i) => (
                  <div key={b._id} className={`db-schedule-item color-${i % 4}`}>
                    <div className="db-sched-time">
                      {new Date(b.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="db-sched-body">
                      <div className="db-sched-name">{b.mentee?.name || 'Mentee'}</div>
                      <div className="db-sched-topic">{b.topic}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="db-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 12, fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>Quick Actions</h3>
            <div className="db-quick-links">
              {[
                { to: '/mentor/bookings', label: 'Manage Bookings' },
                { to: '/mentor/courses', label: 'My Courses' },
                { to: '/mentor/resources', label: 'Resources' },
                { to: '/mentor/wallet', label: 'Wallet' },
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

export default MentorDashboard;
