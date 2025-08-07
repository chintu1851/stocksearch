const pool = require('../config/db');
const { createUserSession, clearUserSession } = require('../middleware/auth');
const crypto = require('crypto');

// Simple password hashing (for demo purposes)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// User registration
const register = async (req, res) => {
    try {
        const { username, email, password, first_name, last_name } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password and create user
        const hashedPassword = hashPassword(password);
        
        const userResult = await pool.query(
            'INSERT INTO users (username, email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name',
            [username, email, hashedPassword, first_name, last_name]
        );

        const user = userResult.rows[0];

        // Create default watchlist
        const watchlistResult = await pool.query(
            'INSERT INTO watchlists (user_id, name, description, is_default) VALUES ($1, $2, $3, $4) RETURNING id',
            [user.id, 'My Watchlist', 'Default watchlist', true]
        );

        // Create user settings
        await pool.query(
            'INSERT INTO user_settings (user_id, theme, auto_refresh, refresh_interval, default_watchlist_id) VALUES ($1, $2, $3, $4, $5)',
            [user.id, 'light', true, 30, watchlistResult.rows[0].id]
        );

        // Create session
        const sessionToken = await createUserSession(user.id);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            },
            sessionToken
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// User login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user by username or email
        const userResult = await pool.query(
            'SELECT id, username, email, password, first_name, last_name FROM users WHERE username = $1 OR email = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const hashedPassword = hashPassword(password);

        if (user.password !== hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        const sessionToken = await createUserSession(user.id);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            },
            sessionToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// User logout
const logout = async (req, res) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                           req.cookies?.sessionToken;

        if (sessionToken) {
            await clearUserSession(sessionToken);
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userResult = await pool.query(
            'SELECT id, username, email, first_name, last_name, created_at FROM users WHERE id = $1',
            [req.user.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: userResult.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;

        const updateResult = await pool.query(
            'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, first_name, last_name',
            [first_name, last_name, email, req.user.user_id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            message: 'Profile updated successfully',
            user: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get current user password
        const userResult = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [req.user.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentHashedPassword = hashPassword(current_password);
        if (userResult.rows[0].password !== currentHashedPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        const newHashedPassword = hashPassword(new_password);
        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [newHashedPassword, req.user.user_id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword
}; 