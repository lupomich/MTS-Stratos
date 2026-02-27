import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [message, setMessage] = useState(null);

    const { login, error } = useAuth();
    const { t } = useLanguage();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        const result = await login(formData.username, formData.password);
        if (!result.success) {
            setMessage({ type: 'error', text: result.error });
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img src="/mts-bondvision-logo.svg" alt="MTS BondVision" className="login-logo" />
                    <h1>{t('login.title')}</h1>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    
                    {error && !message && (
                        <div className="message error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">{t('login.username')}</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                            placeholder={t('login.usernamePlaceholder')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{t('login.password')}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder={t('login.passwordPlaceholder')}
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        {t('login.submit')}
                    </button>

                    <div className="demo-credentials">
                        <p><strong>{t('login.demoAccounts')}</strong></p>
                        <p>Admin: <code>admin</code> / <code>admin123</code></p>
                        <p>Trader: <code>demo</code> / <code>user123</code></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
