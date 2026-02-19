import React, { useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import AdminPanel from './AdminPanel';
import './UserSettings.css';

const UserSettings = ({ onClose }) => {
    const { preferences, updatePreferences, resetPreferences } = usePreferences();
    const { user, logout, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('display');
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    const availableColumns = [
        { id: 'isin', label: 'ISIN' },
        { id: 'description', label: 'Description' },
        { id: 'price', label: 'Price' },
        { id: 'yield', label: 'Yield' },
        { id: 'maturity', label: 'Maturity' },
        { id: 'coupon', label: 'Coupon' },
        { id: 'currency', label: 'Currency' },
        { id: 'rating', label: 'Rating' }
    ];

    const handleColumnToggle = (columnId) => {
        const currentColumns = preferences.defaultColumns || [];
        const newColumns = currentColumns.includes(columnId)
            ? currentColumns.filter(id => id !== columnId)
            : [...currentColumns, columnId];
        
        updatePreferences({ defaultColumns: newColumns });
    };

    const handleThemeChange = (theme) => {
        updatePreferences({ theme });
    };

    const handleLanguageChange = (language) => {
        updatePreferences({ language });
    };

    const handleLayoutChange = (gridLayout) => {
        updatePreferences({ gridLayout });
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all preferences to default?')) {
            resetPreferences();
        }
    };

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            if (onClose) onClose();
        }
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>User Settings</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="settings-body">
                    <div className="settings-sidebar">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="user-details">
                                <div className="user-name">{user?.username}</div>
                                <div className="user-role">{user?.role}</div>
                            </div>
                        </div>

                        <nav className="settings-nav">
                            <button
                                className={`nav-item ${activeTab === 'display' ? 'active' : ''}`}
                                onClick={() => setActiveTab('display')}
                            >
                                Display
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'columns' ? 'active' : ''}`}
                                onClick={() => setActiveTab('columns')}
                            >
                                Columns
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                                onClick={() => setActiveTab('account')}
                            >
                                Account
                            </button>
                            {isAdmin && (
                                <button
                                    className="nav-item admin-nav"
                                    onClick={() => setShowAdminPanel(true)}
                                >
                                    👑 Admin Panel
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="settings-content">
                        {activeTab === 'display' && (
                            <div className="settings-section">
                                <h3>Display Settings</h3>

                                <div className="setting-group">
                                    <label>Theme</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="light"
                                                checked={preferences.theme === 'light'}
                                                onChange={(e) => handleThemeChange(e.target.value)}
                                            />
                                            <span>Light</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="dark"
                                                checked={preferences.theme === 'dark'}
                                                onChange={(e) => handleThemeChange(e.target.value)}
                                            />
                                            <span>Dark</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label>Language</label>
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="select-input"
                                    >
                                        <option value="en">English</option>
                                        <option value="it">Italiano</option>
                                        <option value="fr">Français</option>
                                        <option value="de">Deutsch</option>
                                    </select>
                                </div>

                                <div className="setting-group">
                                    <label>Grid Layout</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="layout"
                                                value="compact"
                                                checked={preferences.gridLayout === 'compact'}
                                                onChange={(e) => handleLayoutChange(e.target.value)}
                                            />
                                            <span>Compact</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="layout"
                                                value="comfortable"
                                                checked={preferences.gridLayout === 'comfortable'}
                                                onChange={(e) => handleLayoutChange(e.target.value)}
                                            />
                                            <span>Comfortable</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="layout"
                                                value="spacious"
                                                checked={preferences.gridLayout === 'spacious'}
                                                onChange={(e) => handleLayoutChange(e.target.value)}
                                            />
                                            <span>Spacious</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'columns' && (
                            <div className="settings-section">
                                <h3>Default Columns</h3>
                                <p className="section-description">
                                    Select which columns to display by default in the bond table
                                </p>

                                <div className="columns-list">
                                    {availableColumns.map(column => (
                                        <label key={column.id} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={preferences.defaultColumns?.includes(column.id)}
                                                onChange={() => handleColumnToggle(column.id)}
                                            />
                                            <span>{column.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="settings-section">
                                <h3>Account Settings</h3>

                                <div className="account-info">
                                    <div className="info-row">
                                        <span className="info-label">Username:</span>
                                        <span className="info-value">{user?.username}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{user?.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Role:</span>
                                        <span className="info-value role-badge">{user?.role}</span>
                                    </div>
                                </div>

                                <div className="danger-zone">
                                    <h4>Danger Zone</h4>
                                    <button className="reset-btn" onClick={handleReset}>
                                        Reset All Preferences
                                    </button>
                                    <button className="logout-btn" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {showAdminPanel && (
                    <AdminPanel onClose={() => setShowAdminPanel(false)} />
                )}
            </div>
        </div>
    );
};

export default UserSettings;
