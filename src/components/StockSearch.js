import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  StarOff, 
  Plus, 
  Minus,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  Info,
  AlertCircle
} from 'lucide-react';
import { 
  stockService, 
  formatCurrency, 
  formatPercentage, 
  getChangeColor, 
  getChangeBgColor,
  formatNumber 
} from '../services/stockService';

const StockSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [showChart, setShowChart] = useState(false);
  const [notification, setNotification] = useState(null);

  // Popular stocks for quick access
  const popularStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX',
    'SPY', 'QQQ', 'VTI', 'VOO', 'ARKK', 'TSLA', 'PLTR', 'COIN'
  ];

  // Search for stock data
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery(
    ['stockSearch', searchTerm],
    async () => {
      if (!searchTerm || searchTerm.length < 1) return null;
      
      try {
        // Search by symbol first
        const response = await stockService.getStockData(searchTerm.toUpperCase());
        return [response];
      } catch (error) {
        // If symbol not found, try searching by name (mock implementation)
        const mockResults = popularStocks
          .filter(stock => stock.toLowerCase().includes(searchTerm.toLowerCase()))
          .slice(0, 5)
          .map(symbol => ({
            symbol,
            name: `${symbol} Corporation`,
            price: Math.random() * 1000 + 50,
            change: (Math.random() - 0.5) * 20,
            changePercent: (Math.random() - 0.5) * 10,
            volume: Math.floor(Math.random() * 10000000),
            marketCap: Math.floor(Math.random() * 1000000000000)
          }));
        return mockResults;
      }
    },
    {
      enabled: searchTerm.length >= 1,
      staleTime: 30000,
      refetchInterval: 60000
    }
  );

  // Get detailed stock data
  const { data: stockData, isLoading: stockLoading } = useQuery(
    ['stockDetails', selectedStock],
    async () => {
      if (!selectedStock) return null;
      
      const [basicData, chartData, details, news] = await Promise.all([
        stockService.getStockData(selectedStock),
        stockService.getStockChart(selectedStock, timeframe),
        stockService.getStockDetails(selectedStock),
        stockService.getStockNews(selectedStock, 5)
      ]);
      
      return { basicData, chartData, details, news };
    },
    {
      enabled: !!selectedStock,
      staleTime: 30000,
      refetchInterval: 30000
    }
  );

  // Get chart data
  const { data: chartData, isLoading: chartLoading } = useQuery(
    ['stockChart', selectedStock, timeframe],
    async () => {
      if (!selectedStock) return null;
      return await stockService.getStockChart(selectedStock, timeframe);
    },
    {
      enabled: !!selectedStock,
      staleTime: 60000,
      refetchInterval: 60000
    }
  );

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length >= 1) {
      setSelectedStock(term.toUpperCase());
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock.symbol || stock);
    setSearchTerm(stock.symbol || stock);
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      setNotification({ type: 'success', message: `${symbol} added to watchlist!` });
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
    setNotification({ type: 'success', message: `${symbol} removed from watchlist!` });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const formatChartData = (data) => {
    if (!data || !data.results) return [];
    
    return data.results.map(item => ({
      date: new Date(item.t).toLocaleDateString(),
      price: item.c,
      volume: item.v,
      high: item.h,
      low: item.l,
      open: item.o
    }));
  };

  const getTimeframeLabel = (tf) => {
    const labels = {
      '1D': '1 Day',
      '1W': '1 Week',
      '1M': '1 Month',
      '3M': '3 Months',
      '6M': '6 Months',
      '1Y': '1 Year'
    };
    return labels[tf] || tf;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Stock Search</h1>
              <p className="text-gray-600">Search stocks by symbol or company name</p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md border ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={closeNotification}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Stocks</h2>
              
              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Enter symbol or company name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Popular Stocks */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Stocks</h3>
                <div className="grid grid-cols-2 gap-2">
                  {popularStocks.slice(0, 8).map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => handleStockSelect(symbol)}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {searchLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results</h3>
                  {searchResults.map((stock, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-600">{stock.name || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(stock.price)}
                          </div>
                          <div className={`text-sm ${getChangeColor(stock.changePercent)}`}>
                            {formatPercentage(stock.changePercent)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                      <p className="text-sm text-red-700 mt-1">{searchError.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Watchlist */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Watchlist</h2>
              {watchlist.length === 0 ? (
                <p className="text-gray-500 text-sm">No stocks in watchlist</p>
              ) : (
                <div className="space-y-2">
                  {watchlist.map((symbol) => (
                    <div key={symbol} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <span className="font-medium">{symbol}</span>
                      <button
                        onClick={() => removeFromWatchlist(symbol)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <StarOff className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock Details */}
          <div className="lg:col-span-2">
            {selectedStock ? (
              <div className="space-y-6">
                {/* Stock Header */}
                {stockData?.basicData && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {stockData.basicData.symbol}
                        </h2>
                        <p className="text-gray-600">{stockData.basicData.name || 'N/A'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => addToWatchlist(stockData.basicData.symbol)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Add to watchlist"
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(stockData.basicData.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Change</p>
                        <p className={`text-xl font-bold ${getChangeColor(stockData.basicData.change)}`}>
                          {formatCurrency(stockData.basicData.change)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Change %</p>
                        <p className={`text-xl font-bold ${getChangeColor(stockData.basicData.changePercent)}`}>
                          {formatPercentage(stockData.basicData.changePercent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Volume</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatNumber(stockData.basicData.volume)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
                    <div className="flex space-x-2">
                      {['1D', '1W', '1M', '3M', '6M', '1Y'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            timeframe === tf
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {getTimeframeLabel(tf)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : chartData && chartData.results ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={formatChartData(chartData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(value), 
                            name === 'price' ? 'Price' : name
                          ]} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No chart data available
                    </div>
                  )}
                </div>

                {/* Company Info */}
                {stockData?.details && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Market Cap</p>
                        <p className="font-medium">{formatCurrency(stockData.details.marketCap || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">52 Week High</p>
                        <p className="font-medium">{formatCurrency(stockData.details.high52Weeks || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">52 Week Low</p>
                        <p className="font-medium">{formatCurrency(stockData.details.low52Weeks || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">P/E Ratio</p>
                        <p className="font-medium">{stockData.details.peRatio || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* News */}
                {stockData?.news && stockData.news.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest News</h3>
                    <div className="space-y-4">
                      {stockData.news.slice(0, 3).map((article, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-2">{article.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a Stock</h3>
                  <p className="text-gray-600">Enter a stock symbol or company name to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSearch; 