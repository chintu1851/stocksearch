const pool = require('../config/db');
const crypto = require('crypto');

// Simple session-based authentication
const authenticateUser = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                           req.cookies?.sessionToken;

        if (!sessionToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if session exists and is valid
        const sessionQuery = `
            SELECT us.user_id, u.username, u.email, u.first_name, u.last_name
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            WHERE us.session_token = $1 AND us.expires_at > NOW()
        `;
        
        const sessionResult = await pool.query(sessionQuery, [sessionToken]);
        
        if (sessionResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        req.user = sessionResult.rows[0];
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Generate session token
const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Create user session
const createUserSession = async (userId) => {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const query = `
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
        session_token = EXCLUDED.session_token,
        expires_at = EXCLUDED.expires_at
    `;

    await pool.query(query, [userId, sessionToken, expiresAt]);
    return sessionToken;
};

// Clear user session
const clearUserSession = async (sessionToken) => {
    const query = 'DELETE FROM user_sessions WHERE session_token = $1';
    await pool.query(query, [sessionToken]);
};

// Optional authentication (for public routes)
const optionalAuth = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                           req.cookies?.sessionToken;

        if (sessionToken) {
            const sessionQuery = `
                SELECT us.user_id, u.username, u.email, u.first_name, u.last_name
                FROM user_sessions us
                JOIN users u ON us.user_id = u.id
                WHERE us.session_token = $1 AND us.expires_at > NOW()
            `;
            
            const sessionResult = await pool.query(sessionQuery, [sessionToken]);
            
            if (sessionResult.rows.length > 0) {
                req.user = sessionResult.rows[0];
            }
        }
        
        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
};

module.exports = {
    authenticateUser,
    createUserSession,
    clearUserSession,
    optionalAuth
}; 