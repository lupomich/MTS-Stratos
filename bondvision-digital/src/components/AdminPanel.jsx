import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AdminPanel = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: 'viewer' });
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const { isAdmin } = useAuth();
    const { t } = useLanguage();
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
            setCreateError(t('admin.allFieldsRequired'));
            return;
        }
        if (!validatePassword(createForm.password)) {
            setCreateError(t('admin.passwordValidation'));
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
            setCreateError(err.response?.data?.error || t('admin.failedCreateUser'));
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
            setError(t('admin.failedLoadUsers'));
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
            alert(t('admin.failedUpdateUserStatus'));
        }
    };

    const handleDeleteUser = async (userId, username) => {
        const deleteMessage = t('admin.deleteUserConfirm').replace('{username}', username);
        if (!confirm(deleteMessage)) {
            return;
        }

        try {
            await axios.delete(`/users/${userId}`);
            loadUsers();
        } catch (error) {
            alert(t('admin.failedDeleteUser'));
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.put(`/users/${userId}`, { role: newRole });
            loadUsers();
        } catch (error) {
            alert(t('admin.failedUpdateUserRole'));
        }
    };

    if (!isAdmin) {
        return (
            <div className="admin-overlay" onClick={onClose}>
                <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="admin-header">
                        <h2>{t('admin.accessDenied')}</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="admin-body">
                        <p>{t('admin.accessDeniedMessage')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-header">
                    <h2>{t('admin.panelTitle')}</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button className="btn-create-user" onClick={handleOpenCreate} title={t('admin.createUser')}>
                            <span className="btn-create-icon">+</span> {t('admin.createUser')}
                        </button>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                </div>

                <div className="admin-body">
                    {loading && <div className="loading">{t('admin.loadingUsers')}</div>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !error && (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.colUsername')}</th>
                                        <th>{t('admin.colEmail')}</th>
                                        <th>{t('admin.colRole')}</th>
                                        <th>{t('admin.colStatus')}</th>
                                        <th>{t('admin.colLastLogin')}</th>
                                        <th>{t('admin.colCreatedBy')}</th>
                                        <th>{t('admin.colActions')}</th>
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
                                                    <option value="viewer">{t('admin.roleViewer')}</option>
                                                    <option value="trader">{t('admin.roleTrader')}</option>
                                                    <option value="admin">{t('admin.roleAdmin')}</option>
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                    {user.is_active ? t('admin.active') : t('admin.inactive')}
                                                </span>
                                            </td>
                                            <td>
                                                {user.last_login 
                                                    ? new Date(user.last_login).toLocaleString()
                                                    : t('admin.never')}
                                            </td>
                                            <td>{user.created_by_username || t('admin.system')}</td>
                                            <td className="actions">
                                                <label className="toggle-switch" title={user.is_active ? t('admin.deactivateUser') : t('admin.activateUser')}>
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
                                                    title={t('admin.deleteUser')}
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
                                <h3>{t('admin.createNewUser')}</h3>
                                <button className="close-btn" onClick={handleCloseCreate}>×</button>
                            </div>
                            <form className="modal-form" onSubmit={handleCreateUser} autoComplete="off">
                                <label>
                                    {t('admin.username')}
                                    <input
                                        name="username"
                                        type="text"
                                        value={createForm.username}
                                        onChange={handleCreateInput}
                                        placeholder={t('admin.usernamePlaceholder')}
                                        autoComplete="off"
                                        required
                                    />
                                </label>
                                <label>
                                    {t('admin.email')}
                                    <input
                                        name="email"
                                        type="email"
                                        value={createForm.email}
                                        onChange={handleCreateInput}
                                        placeholder={t('admin.emailPlaceholder')}
                                        autoComplete="off"
                                        required
                                    />
                                </label>
                                <label>
                                    {t('admin.password')}
                                    <input
                                        name="password"
                                        type="password"
                                        value={createForm.password}
                                        onChange={handleCreateInput}
                                        placeholder={t('admin.passwordPlaceholder')}
                                        autoComplete="new-password"
                                        required
                                    />
                                </label>
                                <label>
                                    {t('admin.role')}
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
                                    {createLoading ? t('admin.creating') : t('admin.createUser')}
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
