import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [message, setMessage] = useState(null);

    const { login, error } = useAuth();

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
                    <h1>MTS Stratos</h1>
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
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Login
                    </button>

                    <div className="demo-credentials">
                        <p><strong>Demo Accounts:</strong></p>
                        <p>Admin: <code>admin</code> / <code>admin123</code></p>
                        <p>Trader: <code>demo</code> / <code>user123</code></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
