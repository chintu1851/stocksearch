const pool = require('../config/db');

// Get all watchlists for user
const getWatchlists = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const query = `
            SELECT 
                w.id,
                w.name,
                w.description,
                w.is_default,
                w.created_at,
                w.updated_at,
                COUNT(wi.symbol) as stock_count
            FROM watchlists w
            LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
            WHERE w.user_id = $1
            GROUP BY w.id, w.name, w.description, w.is_default, w.created_at, w.updated_at
            ORDER BY w.is_default DESC, w.created_at ASC
        `;
        
        const result = await pool.query(query, [userId]);
        
        // Get stocks for each watchlist
        const watchlists = await Promise.all(
            result.rows.map(async (watchlist) => {
                const stocksQuery = `
                    SELECT symbol, added_at
                    FROM watchlist_items
                    WHERE watchlist_id = $1
                    ORDER BY added_at ASC
                `;
                
                const stocksResult = await pool.query(stocksQuery, [watchlist.id]);
                
                return {
                    ...watchlist,
                    stocks: stocksResult.rows
                };
            })
        );
        
        res.json(watchlists);
    } catch (error) {
        console.error('Error fetching watchlists:', error);
        res.status(500).json({ error: 'Failed to fetch watchlists' });
    }
};

// Get specific watchlist
const getWatchlist = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const watchlistId = req.params.id;
        
        // Check if user owns this watchlist
        const ownershipQuery = `
            SELECT id, name, description, is_default, created_at, updated_at
            FROM watchlists
            WHERE id = $1 AND user_id = $2
        `;
        
        const ownershipResult = await pool.query(ownershipQuery, [watchlistId, userId]);
        
        if (ownershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }
        
        const watchlist = ownershipResult.rows[0];
        
        // Get stocks in this watchlist
        const stocksQuery = `
            SELECT symbol, added_at
            FROM watchlist_items
            WHERE watchlist_id = $1
            ORDER BY added_at ASC
        `;
        
        const stocksResult = await pool.query(stocksQuery, [watchlistId]);
        
        res.json({
            ...watchlist,
            stocks: stocksResult.rows
        });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
};

// Create new watchlist
const createWatchlist = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Watchlist name is required' });
        }
        
        const query = `
            INSERT INTO watchlists (user_id, name, description)
            VALUES ($1, $2, $3)
            RETURNING id, name, description, is_default, created_at, updated_at
        `;
        
        const result = await pool.query(query, [userId, name, description || '']);
        
        res.status(201).json({
            ...result.rows[0],
            stocks: []
        });
    } catch (error) {
        console.error('Error creating watchlist:', error);
        res.status(500).json({ error: 'Failed to create watchlist' });
    }
};

// Update watchlist
const updateWatchlist = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const watchlistId = req.params.id;
        const { name, description } = req.body;
        
        // Check if user owns this watchlist
        const ownershipQuery = `
            SELECT id FROM watchlists
            WHERE id = $1 AND user_id = $2
        `;
        
        const ownershipResult = await pool.query(ownershipQuery, [watchlistId, userId]);
        
        if (ownershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }
        
        const query = `
            UPDATE watchlists 
            SET name = $1, description = $2, updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            RETURNING id, name, description, is_default, created_at, updated_at
        `;
        
        const result = await pool.query(query, [name, description, watchlistId, userId]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating watchlist:', error);
        res.status(500).json({ error: 'Failed to update watchlist' });
    }
};

// Delete watchlist
const deleteWatchlist = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const watchlistId = req.params.id;
        
        // Check if user owns this watchlist and it's not the default
        const ownershipQuery = `
            SELECT id, is_default FROM watchlists
            WHERE id = $1 AND user_id = $2
        `;
        
        const ownershipResult = await pool.query(ownershipQuery, [watchlistId, userId]);
        
        if (ownershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }
        
        if (ownershipResult.rows[0].is_default) {
            return res.status(400).json({ error: 'Cannot delete default watchlist' });
        }
        
        // Delete watchlist (cascade will delete watchlist_items)
        const query = `
            DELETE FROM watchlists
            WHERE id = $1 AND user_id = $2
        `;
        
        await pool.query(query, [watchlistId, userId]);
        
        res.json({ message: 'Watchlist deleted successfully' });
    } catch (error) {
        console.error('Error deleting watchlist:', error);
        res.status(500).json({ error: 'Failed to delete watchlist' });
    }
};

// Add stock to watchlist
const addStockToWatchlist = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const watchlistId = req.params.id;
        const { symbol } = req.body;
        
        if (!symbol) {
            return res.status(400).json({ error: 'Stock symbol is required' });
        }
        
        // Check if user owns this watchlist
        const ownershipQuery = `
            SELECT id FROM watchlists
            WHERE id = $1 AND user_id = $2
        `;
        
        const ownershipResult = await pool.query(ownershipQuery, [watchlistId, userId]);
        
        if (ownershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }
        
        // Check if stock already exists in watchlist
        const existingQuery = `
            SELECT symbol FROM watchlist_items
            WHERE watchlist_id = $1 AND symbol = $2
        `;
        
        const existingResult = await pool.query(existingQuery, [watchlistId, symbol.toUpperCase()]);
        
        if (existingResult.rows.length > 0) {
            return res.status(409).json({ error: 'Stock already exists in watchlist' });
        }
        
        // Add stock to watchlist
        const insertQuery = `
            INSERT INTO watchlist_items (watchlist_id, symbol)
            VALUES ($1, $2)
        `;
        
        await pool.query(insertQuery, [watchlistId, symbol.toUpperCase()]);
        
        res.json({ 
            message: 'Stock added to watchlist successfully',
            symbol: symbol.toUpperCase()
        });
    } catch (error) {
        console.error('Error adding stock to watchlist:', error);
        res.status(500).json({ error: 'Failed to add stock to watchlist' });
    }
};

// Remove stock from watchlist
const removeStockFromWatchlist = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const watchlistId = req.params.id;
        const symbol = req.params.symbol;
        
        // Check if user owns this watchlist
        const ownershipQuery = `
            SELECT id FROM watchlists
            WHERE id = $1 AND user_id = $2
        `;
        
        const ownershipResult = await pool.query(ownershipQuery, [watchlistId, userId]);
        
        if (ownershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }
        
        // Remove stock from watchlist
        const deleteQuery = `
            DELETE FROM watchlist_items
            WHERE watchlist_id = $1 AND symbol = $2
        `;
        
        const result = await pool.query(deleteQuery, [watchlistId, symbol.toUpperCase()]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Stock not found in watchlist' });
        }
        
        res.json({ 
            message: 'Stock removed from watchlist successfully',
            symbol: symbol.toUpperCase()
        });
    } catch (error) {
        console.error('Error removing stock from watchlist:', error);
        res.status(500).json({ error: 'Failed to remove stock from watchlist' });
    }
};

module.exports = {
    getWatchlists,
    getWatchlist,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStockToWatchlist,
    removeStockFromWatchlist
}; 