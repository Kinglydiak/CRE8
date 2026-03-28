import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/adminService';
import { MdPeople, MdSchool, MdCalendarToday, MdCheckCircle, MdAttachMoney, MdTrendingUp } from 'react-icons/md';
import { toast } from 'react-toastify';
import './Dashboard.css';
import './AdminAnalytics.css';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="aa-stat-card">
    <div className="aa-stat-icon" style={{ background: color + '18', color }}>
      <Icon size={22} />
    </div>
    <div>
      <p className="aa-stat-label">{label}</p>
      <p className="aa-stat-value">{value}</p>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="db-root"><div className="spinner" style={{ margin: '80px auto' }} /></div>;
  if (!data) return null;

  const completionRate = data.totalBookings
    ? Math.round((data.completedBookings / data.totalBookings) * 100)
    : 0;

  return (
    <div className="db-root">
      <div className="db-topbar">
        <div>
          <h1 className="db-page-title">Platform Analytics</h1>
          <p className="db-page-sub">Overview of all platform activity</p>
        </div>
      </div>

      <div style={{ padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Stat cards */}
        <div className="aa-stats-grid">
          <StatCard icon={MdPeople}       label="Total Users"       value={data.totalUsers}        color="#6366f1" />
          <StatCard icon={MdSchool}       label="Mentors"           value={data.totalMentors}      color="#8b5cf6" />
          <StatCard icon={MdPeople}       label="Mentees"           value={data.totalMentees}      color="#3b82f6" />
          <StatCard icon={MdCalendarToday} label="Total Bookings"   value={data.totalBookings}     color="#f59e0b" />
          <StatCard icon={MdCheckCircle}  label="Completed Sessions" value={data.completedBookings} color="#10b981" />
          <StatCard icon={MdAttachMoney}  label="Total Revenue (RWF)" value={data.totalRevenue.toLocaleString()} color="#ec4899" />
        </div>

        {/* Completion rate bar */}
        <div className="aa-card">
          <div className="aa-card-header">
            <MdTrendingUp size={18} />
            <span>Session Completion Rate</span>
            <span className="aa-rate-pct">{completionRate}%</span>
          </div>
          <div className="aa-progress-track">
            <div className="aa-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="aa-progress-sub">{data.completedBookings} of {data.totalBookings} bookings completed</p>
        </div>

        <div className="aa-two-col">
          {/* Top mentors */}
          <div className="aa-card">
            <h3 className="aa-section-title">Top Mentors by Rating</h3>
            {data.topMentors.length === 0
              ? <p className="aa-empty">No mentors yet</p>
              : (
                <table className="aa-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Rating</th>
                      <th>Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topMentors.map((m, i) => (
                      <tr key={m._id}>
                        <td className="aa-rank">{i + 1}</td>
                        <td>
                          <div className="aa-user-cell">
                            <div className="aa-avatar">{m.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <p className="aa-name">{m.name}</p>
                              <p className="aa-email">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="aa-rating">★ {(m.rating || 0).toFixed(1)}</span>
                        </td>
                        <td className="aa-sessions">{m.completedSessions || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>

          {/* Recent bookings */}
          <div className="aa-card">
            <h3 className="aa-section-title">Recent Bookings</h3>
            {data.recentBookings.length === 0
              ? <p className="aa-empty">No bookings yet</p>
              : (
                <div className="aa-bookings-list">
                  {data.recentBookings.map(b => (
                    <div key={b._id} className="aa-booking-row">
                      <div className="aa-booking-info">
                        <p className="aa-name">{b.mentee?.name || '—'} → {b.mentor?.name || '—'}</p>
                        <p className="aa-email">{new Date(b.sessionDate || b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`aa-status aa-status-${b.status}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
