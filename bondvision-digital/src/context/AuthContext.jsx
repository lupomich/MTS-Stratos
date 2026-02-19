import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Use absolute URL to backend (CORS enabled in server.js)
const API_URL = 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    axios.defaults.baseURL = API_URL;
    
    // Add token to requests
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await axios.post('/auth/login', { username, password });
            const { token, user } = response.data;

            // Store token
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (username, email, password) => {
        try {
            setError(null);
            const response = await axios.post('/auth/register', { username, email, password });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear state regardless of API result
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const updateUser = (updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
