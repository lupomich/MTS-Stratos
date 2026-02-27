import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import './UserSettings.css';

const UserSettings = ({ onClose }) => {
    const { preferences, setRfqOpenInPopup, setRfqAlwaysOnTop } = usePreferences();
    const { t } = useLanguage();

    const handleRfqWindowChange = (enabled) => {
        setRfqOpenInPopup(enabled);
        if (!enabled && preferences.rfqAlwaysOnTop) {
            setRfqAlwaysOnTop(false);
        }
    };

    const handleRfqAlwaysOnTopChange = (enabled) => {
        setRfqAlwaysOnTop(enabled);
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>{t('userSettings.title')}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="settings-body">
                    <div className="settings-content">
                        <div className="settings-section">
                            <h3>{t('userSettings.rfqSettings')}</h3>

                            <div className="setting-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(preferences.rfqOpenInPopup)}
                                        onChange={(e) => handleRfqWindowChange(e.target.checked)}
                                    />
                                    <span>{t('userSettings.openRfqInPopup')}</span>
                                </label>
                            </div>

                            <div className="setting-group" style={{ marginTop: '12px' }}>
                                <label className={`checkbox-label ${!preferences.rfqOpenInPopup ? 'disabled' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(preferences.rfqAlwaysOnTop)}
                                        onChange={(e) => handleRfqAlwaysOnTopChange(e.target.checked)}
                                        disabled={!preferences.rfqOpenInPopup}
                                    />
                                    <span>{t('userSettings.rfqAlwaysOnTop')}</span>
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
