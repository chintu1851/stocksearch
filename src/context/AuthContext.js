import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionToken, setSessionToken] = useState(localStorage.getItem('sessionToken'));

    // Configure axios defaults
    axios.defaults.baseURL = 'http://localhost:3001/api';
    axios.defaults.withCredentials = true;

    // Set up axios interceptor for authentication
    useEffect(() => {
        if (sessionToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [sessionToken]);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            if (sessionToken) {
                try {
                    const response = await axios.get('/auth/profile');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [sessionToken]);

    const login = async (username, password) => {
        try {
            const response = await axios.post('/auth/login', { username, password });
            const { user, sessionToken } = response.data;
            
            setUser(user);
            setSessionToken(sessionToken);
            localStorage.setItem('sessionToken', sessionToken);
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/auth/register', userData);
            const { user, sessionToken } = response.data;
            
            setUser(user);
            setSessionToken(sessionToken);
            localStorage.setItem('sessionToken', sessionToken);
            
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Registration failed' 
            };
        }
    };

    const logout = async () => {
        try {
            if (sessionToken) {
                await axios.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setSessionToken(null);
            localStorage.removeItem('sessionToken');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/auth/profile', profileData);
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.error('Profile update error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Profile update failed' 
            };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            await axios.put('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return { success: true };
        } catch (error) {
            console.error('Password change error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Password change failed' 
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 