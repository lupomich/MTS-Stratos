import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAdmin } = useAuth();

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
                    <button className="close-btn" onClick={onClose}>×</button>
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
            </div>
        </div>
    );
};

export default AdminPanel;
