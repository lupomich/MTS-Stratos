import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import './UserSettings.css';

const UserSettings = ({ onClose }) => {
    const { preferences, setRfqOpenInPopup } = usePreferences();

    const handleRfqWindowChange = (enabled) => {
        setRfqOpenInPopup(enabled);
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>User Settings</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="settings-body">
                    <div className="settings-content">
                        <div className="settings-section">
                            <h3>RFQ Settings</h3>

                            <div className="setting-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(preferences.rfqOpenInPopup)}
                                        onChange={(e) => handleRfqWindowChange(e.target.checked)}
                                    />
                                    <span>Open RFQ in separate window</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
