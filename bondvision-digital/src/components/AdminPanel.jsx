import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: 'viewer' });
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const { isAdmin } = useAuth();
    // Create user handler
    const handleOpenCreate = () => {
        setCreateForm({ username: '', email: '', password: '', role: 'viewer' });
        setCreateError('');
        setShowCreateModal(true);
    };

    const handleCloseCreate = () => {
        setShowCreateModal(false);
        setCreateForm({ username: '', email: '', password: '', role: 'viewer' });
        setCreateError('');
    };

    const handleCreateInput = (e) => {
        const { name, value } = e.target;
        setCreateForm(f => ({ ...f, [name]: value }));
    };

    function validatePassword(pw) {
        // At least 8 chars, 1 letter, 1 number, 1 symbol
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(pw);
    }

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateError('');
        if (!createForm.username || !createForm.email || !createForm.password) {
            setCreateError('All fields are required.');
            return;
        }
        if (!validatePassword(createForm.password)) {
            setCreateError('Password must be at least 8 characters and include a letter, number, and symbol.');
            return;
        }
        setCreateLoading(true);
        try {
            await axios.post('/users', {
                username: createForm.username,
                email: createForm.email,
                password: createForm.password,
                role: createForm.role
            });
            handleCloseCreate();
            loadUsers();
        } catch (err) {
            setCreateError(err.response?.data?.error || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users');
            setUsers(response.data.users);
        } catch (error) {
            setError('Failed to load users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await axios.put(`/users/${userId}`, {
                is_active: !currentStatus
            });
            loadUsers();
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        try {
            await axios.delete(`/users/${userId}`);
            loadUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.put(`/users/${userId}`, { role: newRole });
            loadUsers();
        } catch (error) {
            alert('Failed to update user role');
        }
    };

    if (!isAdmin) {
        return (
            <div className="admin-overlay" onClick={onClose}>
                <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="admin-header">
                        <h2>Access Denied</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="admin-body">
                        <p>You need admin privileges to access this panel.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-header">
                    <h2>Admin Panel - User Management</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button className="btn-create-user" onClick={handleOpenCreate} title="Create User">
                            <span className="btn-create-icon">+</span> Create User
                        </button>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                </div>

                <div className="admin-body">
                    {loading && <div className="loading">Loading users...</div>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !error && (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Last Login</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                    className="role-select"
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="trader">Trader</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.last_login 
                                                    ? new Date(user.last_login).toLocaleString()
                                                    : 'Never'}
                                            </td>
                                            <td>{user.created_by_username || 'System'}</td>
                                            <td className="actions">
                                                <label className="toggle-switch" title={user.is_active ? 'Deactivate user' : 'Activate user'}>
                                                    <input
                                                        type="checkbox"
                                                        checked={user.is_active}
                                                        onChange={() => handleToggleActive(user.id, user.is_active)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    title="Delete user"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {showCreateModal && (
                    <div className="modal-overlay" onClick={handleCloseCreate}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Create New User</h3>
                                <button className="close-btn" onClick={handleCloseCreate}>×</button>
                            </div>
                            <form className="modal-form" onSubmit={handleCreateUser} autoComplete="off">
                                <label>
                                    Username
                                    <input
                                        name="username"
                                        type="text"
                                        value={createForm.username}
                                        onChange={handleCreateInput}
                                        placeholder="Enter username"
                                        autoComplete="off"
                                        required
                                    />
                                </label>
                                <label>
                                    Email
                                    <input
                                        name="email"
                                        type="email"
                                        value={createForm.email}
                                        onChange={handleCreateInput}
                                        placeholder="Enter email"
                                        autoComplete="off"
                                        required
                                    />
                                </label>
                                <label>
                                    Password
                                    <input
                                        name="password"
                                        type="password"
                                        value={createForm.password}
                                        onChange={handleCreateInput}
                                        placeholder="At least 8 chars, 1 letter, 1 number, 1 symbol"
                                        autoComplete="new-password"
                                        required
                                    />
                                </label>
                                <label>
                                    Role
                                    <select
                                        name="role"
                                        value={createForm.role}
                                        onChange={handleCreateInput}
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="trader">Trader</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                                {createError && <div className="error-message" style={{ marginTop: 8 }}>{createError}</div>}
                                <button className="btn-submit" type="submit" disabled={createLoading}>
                                    {createLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
