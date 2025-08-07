const { Pool } = require('pg');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/portfolio.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/stocksearch',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Mock portfolio data for demonstration
let mockPortfolio = {
  id: 1,
  userId: 1,
  stocks: [
    {
      symbol: 'AAPL',
      shares: 10,
      avgPrice: 150.00,
      currentPrice: 175.50,
      totalValue: 1755.00,
      gainLoss: 255.00,
      gainLossPercent: 17.00
    },
    {
      symbol: 'GOOGL',
      shares: 5,
      avgPrice: 2800.00,
      currentPrice: 2950.00,
      totalValue: 14750.00,
      gainLoss: 750.00,
      gainLossPercent: 5.36
    },
    {
      symbol: 'MSFT',
      shares: 8,
      avgPrice: 300.00,
      currentPrice: 325.00,
      totalValue: 2600.00,
      gainLoss: 200.00,
      gainLossPercent: 8.33
    },
    {
      symbol: 'TSLA',
      shares: 3,
      avgPrice: 800.00,
      currentPrice: 750.00,
      totalValue: 2250.00,
      gainLoss: -150.00,
      gainLossPercent: -6.25
    }
  ],
  totalValue: 21355.00,
  totalCost: 20700.00,
  totalGainLoss: 1055.00,
  totalGainLossPercent: 5.10
};

// Get user portfolio
const getPortfolio = async (req, res) => {
  try {
    // In a real application, you would get the user ID from the JWT token
    const userId = req.user?.id || 1;

    // For now, return mock data
    // In production, you would query the database
    const portfolio = {
      ...mockPortfolio,
      userId: userId
    };

    logger.info(`Portfolio fetched for user ${userId}`);
    res.json(portfolio);

  } catch (error) {
    logger.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

// Buy stock
const buyStock = async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const userId = req.user?.id || 1;

    if (!symbol || !shares || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: symbol, shares, price' 
      });
    }

    if (shares <= 0) {
      return res.status(400).json({ 
        error: 'Shares must be greater than 0' 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ 
        error: 'Price must be greater than 0' 
      });
    }

    // Find existing stock in portfolio
    const existingStock = mockPortfolio.stocks.find(stock => stock.symbol === symbol.toUpperCase());

    if (existingStock) {
      // Update existing position
      const totalShares = existingStock.shares + shares;
      const totalCost = (existingStock.shares * existingStock.avgPrice) + (shares * price);
      const newAvgPrice = totalCost / totalShares;

      existingStock.shares = totalShares;
      existingStock.avgPrice = newAvgPrice;
      existingStock.currentPrice = price;
      existingStock.totalValue = totalShares * price;
      existingStock.gainLoss = existingStock.totalValue - (totalShares * newAvgPrice);
      existingStock.gainLossPercent = ((existingStock.gainLoss / (totalShares * newAvgPrice)) * 100);
    } else {
      // Add new stock to portfolio
      const newStock = {
        symbol: symbol.toUpperCase(),
        shares: shares,
        avgPrice: price,
        currentPrice: price,
        totalValue: shares * price,
        gainLoss: 0,
        gainLossPercent: 0
      };

      mockPortfolio.stocks.push(newStock);
    }

    // Update portfolio totals
    updatePortfolioTotals();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('portfolio-updated', {
        type: 'buy',
        symbol: symbol.toUpperCase(),
        shares: shares,
        price: price,
        portfolio: mockPortfolio
      });
    }

    logger.info(`Stock bought: ${symbol} - ${shares} shares at $${price}`);
    res.json({
      message: 'Stock purchased successfully',
      transaction: {
        type: 'buy',
        symbol: symbol.toUpperCase(),
        shares: shares,
        price: price,
        total: shares * price
      },
      portfolio: mockPortfolio
    });

  } catch (error) {
    logger.error('Error buying stock:', error.message);
    res.status(500).json({ error: 'Failed to buy stock' });
  }
};

// Sell stock
const sellStock = async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const userId = req.user?.id || 1;

    if (!symbol || !shares || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: symbol, shares, price' 
      });
    }

    if (shares <= 0) {
      return res.status(400).json({ 
        error: 'Shares must be greater than 0' 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ 
        error: 'Price must be greater than 0' 
      });
    }

    // Find stock in portfolio
    const stockIndex = mockPortfolio.stocks.findIndex(stock => stock.symbol === symbol.toUpperCase());

    if (stockIndex === -1) {
      return res.status(404).json({ 
        error: 'Stock not found in portfolio' 
      });
    }

    const stock = mockPortfolio.stocks[stockIndex];

    if (stock.shares < shares) {
      return res.status(400).json({ 
        error: 'Insufficient shares to sell' 
      });
    }

    // Calculate gain/loss for this transaction
    const transactionGainLoss = (price - stock.avgPrice) * shares;
    const transactionGainLossPercent = ((price - stock.avgPrice) / stock.avgPrice) * 100;

    // Update stock position
    if (stock.shares === shares) {
      // Selling all shares - remove from portfolio
      mockPortfolio.stocks.splice(stockIndex, 1);
    } else {
      // Selling partial shares - update position
      stock.shares -= shares;
      stock.currentPrice = price;
      stock.totalValue = stock.shares * price;
      stock.gainLoss = stock.totalValue - (stock.shares * stock.avgPrice);
      stock.gainLossPercent = ((stock.gainLoss / (stock.shares * stock.avgPrice)) * 100);
    }

    // Update portfolio totals
    updatePortfolioTotals();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('portfolio-updated', {
        type: 'sell',
        symbol: symbol.toUpperCase(),
        shares: shares,
        price: price,
        gainLoss: transactionGainLoss,
        portfolio: mockPortfolio
      });
    }

    logger.info(`Stock sold: ${symbol} - ${shares} shares at $${price}`);
    res.json({
      message: 'Stock sold successfully',
      transaction: {
        type: 'sell',
        symbol: symbol.toUpperCase(),
        shares: shares,
        price: price,
        total: shares * price,
        gainLoss: transactionGainLoss,
        gainLossPercent: transactionGainLossPercent
      },
      portfolio: mockPortfolio
    });

  } catch (error) {
    logger.error('Error selling stock:', error.message);
    res.status(500).json({ error: 'Failed to sell stock' });
  }
};

// Get portfolio performance
const getPortfolioPerformance = async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    // Calculate performance metrics
    const performance = {
      totalValue: mockPortfolio.totalValue,
      totalCost: mockPortfolio.totalCost,
      totalGainLoss: mockPortfolio.totalGainLoss,
      totalGainLossPercent: mockPortfolio.totalGainLossPercent,
      dailyChange: 125.50, // Mock daily change
      dailyChangePercent: 0.59,
      monthlyChange: 850.00, // Mock monthly change
      monthlyChangePercent: 4.15,
      yearlyChange: 2100.00, // Mock yearly change
      yearlyChangePercent: 10.89,
      bestPerformer: mockPortfolio.stocks.reduce((best, stock) => 
        stock.gainLossPercent > best.gainLossPercent ? stock : best
      ),
      worstPerformer: mockPortfolio.stocks.reduce((worst, stock) => 
        stock.gainLossPercent < worst.gainLossPercent ? stock : worst
      )
    };

    logger.info(`Portfolio performance fetched for user ${userId}`);
    res.json(performance);

  } catch (error) {
    logger.error('Error fetching portfolio performance:', error.message);
    res.status(500).json({ error: 'Failed to fetch portfolio performance' });
  }
};

// Update portfolio totals
const updatePortfolioTotals = () => {
  let totalValue = 0;
  let totalCost = 0;

  mockPortfolio.stocks.forEach(stock => {
    totalValue += stock.totalValue;
    totalCost += stock.shares * stock.avgPrice;
  });

  mockPortfolio.totalValue = totalValue;
  mockPortfolio.totalCost = totalCost;
  mockPortfolio.totalGainLoss = totalValue - totalCost;
  mockPortfolio.totalGainLossPercent = totalCost > 0 ? ((mockPortfolio.totalGainLoss / totalCost) * 100) : 0;
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    // Mock transaction history
    const transactions = [
      {
        id: 1,
        type: 'buy',
        symbol: 'AAPL',
        shares: 10,
        price: 150.00,
        total: 1500.00,
        date: new Date('2024-01-15').toISOString()
      },
      {
        id: 2,
        type: 'buy',
        symbol: 'GOOGL',
        shares: 5,
        price: 2800.00,
        total: 14000.00,
        date: new Date('2024-02-01').toISOString()
      },
      {
        id: 3,
        type: 'sell',
        symbol: 'AAPL',
        shares: 2,
        price: 175.00,
        total: 350.00,
        gainLoss: 50.00,
        date: new Date('2024-03-10').toISOString()
      }
    ];

    logger.info(`Transaction history fetched for user ${userId}`);
    res.json(transactions);

  } catch (error) {
    logger.error('Error fetching transaction history:', error.message);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};

module.exports = {
  getPortfolio,
  buyStock,
  sellStock,
  getPortfolioPerformance,
  getTransactionHistory
}; 