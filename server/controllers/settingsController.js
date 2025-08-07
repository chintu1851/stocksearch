const pool = require('../config/db');

// Get user settings
const getUserSettings = async (req, res) => {
    try {
        const settingsResult = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [req.user.user_id]
        );

        if (settingsResult.rows.length === 0) {
            // Create default settings if none exist
            const defaultSettings = await pool.query(
                `INSERT INTO user_settings (user_id, theme, auto_refresh, refresh_interval)
                 VALUES ($1, 'light', TRUE, 30)
                 RETURNING *`,
                [req.user.user_id]
            );
            return res.json({ settings: defaultSettings.rows[0] });
        }

        res.json({ settings: settingsResult.rows[0] });
    } catch (error) {
        console.error('Get user settings error:', error);
        res.status(500).json({ error: 'Failed to get user settings' });
    }
};

// Update user settings
const updateUserSettings = async (req, res) => {
    try {
        const { theme, auto_refresh, refresh_interval, default_watchlist_id } = req.body;

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (theme !== undefined) {
            updateFields.push(`theme = $${paramCount}`);
            values.push(theme);
            paramCount++;
        }

        if (auto_refresh !== undefined) {
            updateFields.push(`auto_refresh = $${paramCount}`);
            values.push(auto_refresh);
            paramCount++;
        }

        if (refresh_interval !== undefined) {
            updateFields.push(`refresh_interval = $${paramCount}`);
            values.push(refresh_interval);
            paramCount++;
        }

        if (default_watchlist_id !== undefined) {
            updateFields.push(`default_watchlist_id = $${paramCount}`);
            values.push(default_watchlist_id);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No settings to update' });
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(req.user.user_id);

        const query = `
            UPDATE user_settings 
            SET ${updateFields.join(', ')}
            WHERE user_id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            // Create settings if they don't exist
            const createResult = await pool.query(
                `INSERT INTO user_settings (user_id, theme, auto_refresh, refresh_interval, default_watchlist_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [req.user.user_id, theme || 'light', auto_refresh !== undefined ? auto_refresh : true, 
                 refresh_interval || 30, default_watchlist_id]
            );
            return res.json({ 
                message: 'Settings created successfully',
                settings: createResult.rows[0]
            });
        }

        res.json({ 
            message: 'Settings updated successfully',
            settings: result.rows[0]
        });
    } catch (error) {
        console.error('Update user settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

// Get user dashboard data
const getDashboardData = async (req, res) => {
    try {
        // Get user's default watchlist with stocks
        const watchlistResult = await pool.query(
            `SELECT w.*, COUNT(wi.id) as stock_count
             FROM watchlists w
             LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
             WHERE w.user_id = $1 AND w.is_default = TRUE
             GROUP BY w.id`,
            [req.user.user_id]
        );

        // Get all user's watchlists
        const allWatchlistsResult = await pool.query(
            `SELECT w.id, w.name, w.description, w.is_default,
                    COUNT(wi.id) as stock_count
             FROM watchlists w
             LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
             WHERE w.user_id = $1
             GROUP BY w.id, w.name, w.description, w.is_default
             ORDER BY w.is_default DESC, w.created_at DESC`,
            [req.user.user_id]
        );

        // Get user settings
        const settingsResult = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = $1',
            [req.user.user_id]
        );

        res.json({
            defaultWatchlist: watchlistResult.rows[0] || null,
            watchlists: allWatchlistsResult.rows,
            settings: settingsResult.rows[0] || null
        });
    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({ error: 'Failed to get dashboard data' });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        // Get total watchlists
        const watchlistsCount = await pool.query(
            'SELECT COUNT(*) as count FROM watchlists WHERE user_id = $1',
            [req.user.user_id]
        );

        // Get total stocks across all watchlists
        const stocksCount = await pool.query(
            `SELECT COUNT(DISTINCT wi.symbol) as count
             FROM watchlist_items wi
             JOIN watchlists w ON wi.watchlist_id = w.id
             WHERE w.user_id = $1`,
            [req.user.user_id]
        );

        // Get account age
        const accountAge = await pool.query(
            'SELECT created_at FROM users WHERE id = $1',
            [req.user.user_id]
        );

        const daysSinceCreation = accountAge.rows[0] ? 
            Math.floor((Date.now() - new Date(accountAge.rows[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        res.json({
            totalWatchlists: parseInt(watchlistsCount.rows[0].count),
            totalStocks: parseInt(stocksCount.rows[0].count),
            accountAge: daysSinceCreation,
            memberSince: accountAge.rows[0]?.created_at
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to get user statistics' });
    }
};

module.exports = {
    getUserSettings,
    updateUserSettings,
    getDashboardData,
    getUserStats
}; 