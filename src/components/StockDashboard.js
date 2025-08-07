import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Search, Bell, User, Settings,
  BarChart3, Globe, Newspaper, Briefcase, Bookmark, Home,
  Plus, Star, StarOff
} from 'lucide-react';
import { useRealTimeStocks, formatCurrency, formatPercentage, getChangeColor, formatNumber } from '../services/stockService';

const StockDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);
  
  const defaultStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX'];
  const { stocksData, loading, error } = useRealTimeStocks(defaultStocks);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?symbol=${searchTerm.toUpperCase()}`);
    }
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol));
      addNotification(`${symbol} removed from watchlist`, 'success');
    } else {
      setWatchlist([...watchlist, symbol]);
      addNotification(`${symbol} added to watchlist`, 'success');
    }
  };

  useEffect(() => {
    // Welcome notification
    addNotification('Welcome to Stock Search Pro! 🚀', 'success');
  }, []);

  const navigationItems = [
    { name: 'Dashboard', icon: Home, path: '/', active: location.pathname === '/' },
    { name: 'Stock Search', icon: Search, path: '/search', active: location.pathname === '/search' },
    { name: 'Portfolio', icon: Briefcase, path: '/portfolio', active: location.pathname === '/portfolio' },
    { name: 'Watchlist', icon: Bookmark, path: '/watchlist', active: location.pathname === '/watchlist' },
    { name: 'Profile', icon: User, path: '/profile', active: location.pathname === '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings', active: location.pathname === '/settings' }
  ];

  const renderStockCard = (stock) => {
    if (!stock) return null;

    const isInWatchlist = watchlist.includes(stock.symbol);
    
    return (
      <div key={stock.symbol} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
            <p className="text-sm text-gray-600">{stock.name || 'N/A'}</p>
          </div>
          <button
            onClick={() => toggleWatchlist(stock.symbol)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              isInWatchlist ? 'text-yellow-600' : 'text-gray-400'
            }`}
          >
            {isInWatchlist ? <Star className="h-5 w-5" /> : <StarOff className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(stock.price)}
            </span>
            <div className="flex items-center space-x-1">
              {stock.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                {formatPercentage(stock.changePercent)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Volume</p>
              <p className="font-medium">{formatNumber(stock.volume)}</p>
            </div>
            <div>
              <p className="text-gray-600">Market Cap</p>
              <p className="font-medium">{formatCurrency(stock.marketCap)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📈 Stock Search Pro</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search stocks..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg shadow-sm p-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-md border ${
                  notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : notification.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Cards */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Live Market Data</h2>
                <div className="flex items-center space-x-2">
                  {loading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Updating...
                    </div>
                  )}
                </div>
              </div>

              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading stock data: {error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stocksData.map(renderStockCard)}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Search Stocks</span>
                </button>
                
                <button
                  onClick={() => navigate('/portfolio')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Portfolio</span>
                </button>
                
                <button
                  onClick={() => navigate('/watchlist')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <Bookmark className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Watchlist</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Real-time Data</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WebSocket</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Market Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">S&P 500</span>
                  <span className="text-sm font-medium text-green-600">+0.85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">NASDAQ</span>
                  <span className="text-sm font-medium text-green-600">+1.23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">DOW</span>
                  <span className="text-sm font-medium text-red-600">-0.12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard; 