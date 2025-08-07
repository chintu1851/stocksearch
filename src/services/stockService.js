import axios from 'axios';
import io from 'socket.io-client';
import { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket.io connection
let socket = null;

// Initialize socket connection
export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Stock API functions
export const stockService = {
  // Get single stock data
  async getStockData(symbol) {
    try {
      const response = await apiClient.get(`/stocks/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  },

  // Get batch stock data
  async getBatchStocks(symbols) {
    try {
      const symbolsString = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const response = await apiClient.get(`/stocks/batch?symbols=${symbolsString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch stocks:', error);
      throw error;
    }
  },

  // Get stock chart data
  async getStockChart(symbol, timeframe = '1D', multiplier = 1) {
    try {
      const response = await apiClient.get(`/stocks/${symbol}/chart`, {
        params: { timeframe, multiplier }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  // Get stock details
  async getStockDetails(symbol) {
    try {
      const response = await apiClient.get(`/stocks/${symbol}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock details:', error);
      throw error;
    }
  },

  // Get stock news
  async getStockNews(symbol, limit = 10) {
    try {
      const response = await apiClient.get(`/stocks/${symbol}/news`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock news:', error);
      throw error;
    }
  },

  // Get market data
  async getMarketData() {
    try {
      const response = await apiClient.get('/stocks/market');
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  },

  // Get cache status
  async getCacheStatus() {
    try {
      const response = await apiClient.get('/stocks/cache');
      return response.data;
    } catch (error) {
      console.error('Error fetching cache status:', error);
      throw error;
    }
  }
};

// Portfolio API functions
export const portfolioService = {
  // Get user portfolio
  async getPortfolio() {
    try {
      const response = await apiClient.get('/portfolio');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  // Buy stock
  async buyStock(symbol, shares, price) {
    try {
      const response = await apiClient.post('/portfolio/buy', {
        symbol,
        shares,
        price
      });
      return response.data;
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  },

  // Sell stock
  async sellStock(symbol, shares, price) {
    try {
      const response = await apiClient.post('/portfolio/sell', {
        symbol,
        shares,
        price
      });
      return response.data;
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  },

  // Get portfolio performance
  async getPortfolioPerformance() {
    try {
      const response = await apiClient.get('/portfolio/performance');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio performance:', error);
      throw error;
    }
  }
};

// WebSocket event handlers
export const socketService = {
  // Subscribe to stock updates
  subscribeToStock(symbol, callback) {
    const socket = getSocket();
    socket.emit('subscribe-stocks', [symbol]);
    socket.on('stock-update', callback);
    
    return () => {
      socket.off('stock-update', callback);
    };
  },

  // Subscribe to multiple stocks
  subscribeToStocks(symbols, callback) {
    const socket = getSocket();
    socket.emit('subscribe-stocks', symbols);
    socket.on('stock-update', callback);
    
    return () => {
      socket.off('stock-update', callback);
    };
  },

  // Join user room for personalized updates
  joinUserRoom(userId) {
    const socket = getSocket();
    socket.emit('join-user', userId);
  },

  // Listen for watchlist updates
  onWatchlistUpdate(callback) {
    const socket = getSocket();
    socket.on('watchlist-changed', callback);
    
    return () => {
      socket.off('watchlist-changed', callback);
    };
  },

  // Listen for portfolio updates
  onPortfolioUpdate(callback) {
    const socket = getSocket();
    socket.on('portfolio-changed', callback);
    
    return () => {
      socket.off('portfolio-changed', callback);
    };
  },

  // Listen for price updates
  onPriceUpdate(callback) {
    const socket = getSocket();
    socket.on('price-updated', callback);
    
    return () => {
      socket.off('price-updated', callback);
    };
  }
};

// Real-time data hooks
export const useRealTimeStock = (symbol) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    // Initial fetch
    stockService.getStockData(symbol)
      .then(data => {
        setStockData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = socketService.subscribeToStock(symbol, (data) => {
      if (data.symbol === symbol) {
        setStockData(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  return { stockData, loading, error };
};

// Batch real-time data hook
export const useRealTimeStocks = (symbols) => {
  const [stocksData, setStocksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    setLoading(true);
    setError(null);

    // Initial fetch
    stockService.getBatchStocks(symbols)
      .then(data => {
        setStocksData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = socketService.subscribeToStocks(symbols, (data) => {
      setStocksData(prev => {
        const index = prev.findIndex(stock => stock.symbol === data.symbol);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [symbols]);

  return { stocksData, loading, error };
};

// Market data hook
export const useMarketData = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    stockService.getMarketData()
      .then(data => {
        setMarketData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { marketData, loading, error };
};

// Portfolio hook
export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    portfolioService.getPortfolio()
      .then(data => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { portfolio, loading, error };
};

// Utility functions
export const formatCurrency = (amount) => {
  if (amount === 'N/A' || amount === null || amount === undefined) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value) => {
  if (value === 'N/A' || value === null || value === undefined) {
    return 'N/A';
  }
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'N/A';
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  if (value === 'N/A' || value === null || value === undefined) {
    return 'N/A';
  }
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('en-US').format(numValue);
};

export const getChangeColor = (change) => {
  if (change === 'N/A' || change === null || change === undefined) {
    return 'text-gray-500';
  }
  const numChange = parseFloat(change);
  if (isNaN(numChange)) return 'text-gray-500';
  return numChange >= 0 ? 'text-green-600' : 'text-red-600';
};

export const getChangeBgColor = (change) => {
  if (change === 'N/A' || change === null || change === undefined) {
    return 'bg-gray-50';
  }
  const numChange = parseFloat(change);
  if (isNaN(numChange)) return 'bg-gray-50';
  return numChange >= 0 ? 'bg-green-50' : 'bg-red-50';
};

// Initialize socket on module load
initializeSocket();

export default {
  stockService,
  portfolioService,
  socketService,
  useRealTimeStock,
  useRealTimeStocks,
  useMarketData,
  usePortfolio,
  formatCurrency,
  formatPercentage,
  formatNumber,
  getChangeColor,
  getChangeBgColor
}; 