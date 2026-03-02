import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import './UserSettings.css';

const UserSettings = ({ onClose }) => {
    const { preferences, setRfqOpenInPopup, setRfqOpenInTab, setRfqAlwaysOnTop, setRfqMaxDealers } = usePreferences();
    const { t } = useLanguage();
    const isPopupOptionDisabled = Boolean(preferences.rfqOpenInTab);
    const isTabOptionDisabled = Boolean(preferences.rfqOpenInPopup);

    const handleRfqWindowChange = (enabled) => {
        setRfqOpenInPopup(enabled);
        if (enabled && preferences.rfqOpenInTab) {
            setRfqOpenInTab(false);
        }
        if (!enabled && preferences.rfqAlwaysOnTop) {
            setRfqAlwaysOnTop(false);
        }
    };

    const handleRfqTabChange = (enabled) => {
        setRfqOpenInTab(enabled);
        if (enabled) {
            if (preferences.rfqOpenInPopup) {
                setRfqOpenInPopup(false);
            }
            if (preferences.rfqAlwaysOnTop) {
                setRfqAlwaysOnTop(false);
            }
        }
    };

    const handleRfqAlwaysOnTopChange = (enabled) => {
        setRfqAlwaysOnTop(enabled);
    };

    const handleMaxDealersChange = (value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) {
            setRfqMaxDealers(6);
            return;
        }

        const bounded = Math.min(20, Math.max(1, parsed));
        setRfqMaxDealers(bounded);
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
                        <div className="settings-section settings-section-card">
                            <h3>{t('userSettings.ticketPosition')}</h3>

                            <div className="setting-group">
                                <label className={`checkbox-label ${isPopupOptionDisabled ? 'disabled' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(preferences.rfqOpenInPopup)}
                                        onChange={(e) => handleRfqWindowChange(e.target.checked)}
                                        disabled={isPopupOptionDisabled}
                                    />
                                    <span>{t('userSettings.openRfqInPopup')}</span>
                                </label>
                            </div>

                            <div className="setting-group setting-group-sub" style={{ marginTop: '12px' }}>
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

                            <div className="setting-group" style={{ marginTop: '12px' }}>
                                <label className={`checkbox-label ${isTabOptionDisabled ? 'disabled' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(preferences.rfqOpenInTab)}
                                        onChange={(e) => handleRfqTabChange(e.target.checked)}
                                        disabled={isTabOptionDisabled}
                                    />
                                    <span>{t('userSettings.openRfqInTab')}</span>
                                </label>
                            </div>
                        </div>

                        <div className="settings-section settings-section-card" style={{ marginTop: '18px' }}>
                            <h3>{t('userSettings.tradingSettings')}</h3>
                            <div className="setting-group" style={{ marginTop: '12px' }}>
                                <label className="setting-input-label">
                                    <span>{t('userSettings.maxNoDealersRfq')}</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        step="1"
                                        value={Number.isFinite(preferences.rfqMaxDealers) ? preferences.rfqMaxDealers : 6}
                                        onChange={(e) => handleMaxDealersChange(e.target.value)}
                                        className="setting-number-input"
                                    />
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
