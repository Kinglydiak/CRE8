import React, { useState, useEffect } from 'react';
import { getAllUsers, verifyMentor, deleteUser } from '../services/adminService';
import { MdVerified, MdDelete, MdSearch, MdPeople } from 'react-icons/md';
import { toast } from 'react-toastify';
import './Dashboard.css';
import './AdminUsers.css';

const ROLES = ['all', 'mentee', 'mentor', 'admin'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirming, setConfirming] = useState(null); // id of user pending delete confirm

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let list = users;
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [users, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyMentor(id);
      toast.success('Mentor verified');
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified: true } : u));
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) return <div className="db-root"><div className="spinner" style={{ margin: '80px auto' }} /></div>;

  return (
    <div className="db-root">
      <div className="db-topbar">
        <div>
          <h1 className="db-page-title">User Management</h1>
          <p className="db-page-sub">{users.length} registered users</p>
        </div>
      </div>

      <div style={{ padding: '20px 32px 40px' }}>
        {/* Filters */}
        <div className="au-filters">
          <div className="au-search">
            <MdSearch className="au-search-icon" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="au-role-tabs">
            {ROLES.map(r => (
              <button
                key={r}
                className={`au-role-tab${roleFilter === r ? ' active' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="au-empty">
            <MdPeople size={48} color="#d1d5db" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="au-user-cell">
                        <div className="au-avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="au-muted">{user.email}</td>
                    <td><span className={`au-badge au-badge-${user.role}`}>{user.role}</span></td>
                    <td>
                      {user.role === 'mentor'
                        ? <span className={`au-badge ${user.isVerified ? 'au-badge-verified' : 'au-badge-pending'}`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        : <span className="au-badge au-badge-active">Active</span>
                      }
                    </td>
                    <td className="au-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="au-actions">
                        {user.role === 'mentor' && !user.isVerified && (
                          <button
                            className="au-btn-verify"
                            onClick={() => handleVerify(user._id)}
                            title="Verify mentor"
                          >
                            <MdVerified size={16} /> Verify
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          confirming === user._id ? (
                            <div className="au-confirm">
                              <span>Delete?</span>
                              <button className="au-btn-confirm-yes" onClick={() => handleDelete(user._id)}>Yes</button>
                              <button className="au-btn-confirm-no" onClick={() => setConfirming(null)}>No</button>
                            </div>
                          ) : (
                            <button
                              className="au-btn-delete"
                              onClick={() => setConfirming(user._id)}
                              title="Delete user"
                            >
                              <MdDelete size={16} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
