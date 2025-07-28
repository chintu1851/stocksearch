import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const allStocks = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NFLX", "NVDA",
  "IBM", "ORCL", "INTC", "CSCO", "ADBE", "CRM", "PYPL", "QCOM",
  "TXN", "AMD", "SBUX", "BA", "CAT", "GE", "MMM", "NKE", "LMT",
  "GS", "JPM", "BAC", "WMT", "HD", "KO", "PEP", "DIS", "VZ", "T",
  "FDX", "HON", "UPS", "LRCX", "NOW", "MDLZ", "MRK", "CVX", "XOM", "COST",
  "BLK", "SCHW", "BKNG", "GILD", "ISRG", "SYK", "ZTS", "ADI", "CSX", "ETN",
  "ADP", "SPGI", "TJX", "CB", "SO", "USB", "CCI", "PLD", "DHR", "SHW",
  "EL", "GM", "F", "TMUS", "TGT", "MO", "SOFI", "SQ", "SHOP",
  "UBER", "LYFT", "SNAP", "ZM", "DOCU", "OKTA", "ROKU", "CRWD", "NET",
  "DDOG", "SNOW", "FSLY", "TEAM", "WDAY", "ZS", "MELI", "PINS", "DKNG", "ROST"
];

const PAGE_SIZE = 10;

export default function Stockcollection() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  
  // Chart and details state
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [stockDetails, setStockDetails] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('1M');
  const [loadingChart, setLoadingChart] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  const totalPages = Math.ceil(allStocks.length / PAGE_SIZE);

  const checkApiStatus = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/stocks/cache');
      setApiStatus(response.data.apiKeyConfigured ? 'configured' : 'not-configured');
    } catch (error) {
      setApiStatus('error');
    }
  }, []);

  const fetchStocksForPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const startIdx = (page - 1) * PAGE_SIZE;
    const symbolsSlice = allStocks.slice(startIdx, startIdx + PAGE_SIZE);
    const symbolsString = symbolsSlice.join(',');

    try {
      const res = await axios.get(`http://localhost:3001/api/stocks/batch?symbols=${symbolsString}`, {
        timeout: 15000
      });
      
      if (res.data && Array.isArray(res.data)) {
        setStocks(res.data);
        setLastUpdated(new Date());
        
        console.log(`Loaded ${res.data.length} stocks with real-time data`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      setError(`Failed to fetch stock data: ${error.response?.data?.error || error.message}`);
      setStocks([]);
    }
    setLoading(false);
  }, [page]);

  const fetchChartData = useCallback(async (symbol, timeframe) => {
    setLoadingChart(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/stocks/chart?symbol=${symbol}&timeframe=${timeframe}`);
      setChartData(response.data.data);
      setShowChart(true);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setError('Failed to load chart data');
    }
    setLoadingChart(false);
  }, []);

  const fetchStockDetails = useCallback(async (symbol) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/stocks/details?symbol=${symbol}`);
      setStockDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch stock details:', error);
    }
  }, []);

  const handleStockClick = useCallback(async (stock) => {
    setSelectedStock(stock);
    await fetchStockDetails(stock.symbol);
    await fetchChartData(stock.symbol, chartTimeframe);
  }, [fetchStockDetails, fetchChartData, chartTimeframe]);

  useEffect(() => {
    checkApiStatus();
  }, [checkApiStatus]);

  useEffect(() => {
    if (apiStatus === 'configured') {
      fetchStocksForPage();
    }
  }, [fetchStocksForPage, apiStatus]);

  useEffect(() => {
    let interval;
    if (autoRefresh && apiStatus === 'configured') {
      interval = setInterval(() => {
        fetchStocksForPage();
      }, 30000); // 30 seconds refresh for real-time data
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStocksForPage, apiStatus]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const filteredStocks = stocks.filter(stock => 
    stock.symbol && stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    if (!price || price === 'N/A') return 'N/A';
    const numPrice = parseFloat(price);
    if (numPrice >= 1000) {
      return `$${(numPrice / 1000).toFixed(2)}K`;
    }
    return `$${numPrice.toFixed(2)}`;
  };

  const formatChange = (change) => {
    if (!change || change === 'N/A') return 'N/A';
    const changeValue = parseFloat(change);
    return changeValue >= 0 ? `+$${changeValue.toFixed(2)}` : `-$${Math.abs(changeValue).toFixed(2)}`;
  };

  const formatChangePercent = (changePercent) => {
    if (!changePercent || changePercent === 'N/A') return 'N/A';
    const percent = parseFloat(changePercent.replace('%', ''));
    return percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getChangeColor = (change) => {
    if (!change || change === 'N/A') return 'text-gray-500';
    const changeValue = parseFloat(change);
    return changeValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeBgColor = (change) => {
    if (!change || change === 'N/A') return 'bg-gray-100';
    const changeValue = parseFloat(change);
    return changeValue >= 0 ? 'bg-green-50' : 'bg-red-50';
  };

  const renderApiStatusMessage = () => {
    switch (apiStatus) {
      case 'checking':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Checking API configuration...</span>
            </div>
          </div>
        );
      case 'not-configured':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Polygon API Key Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>To see real-time stock data, configure your Polygon API key in the .env file.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Server Connection Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to connect to the server. Make sure the backend server is running on port 3001.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStockChart = () => {
    if (!showChart || chartData.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📈 {selectedStock?.symbol} Price Chart ({chartTimeframe})
          </h3>
          <div className="flex space-x-2">
            {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => {
                  setChartTimeframe(timeframe);
                  fetchChartData(selectedStock.symbol, timeframe);
                }}
                className={`px-3 py-1 text-sm rounded ${
                  chartTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
        
        {loadingChart ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [`$${value}`, name]}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  const renderStockDetails = () => {
    if (!stockDetails) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 {stockDetails.symbol} Company Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Company Name</p>
            <p className="font-medium">{stockDetails.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Market</p>
            <p className="font-medium">{stockDetails.market}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exchange</p>
            <p className="font-medium">{stockDetails.primaryExchange}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-medium">{stockDetails.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Currency</p>
            <p className="font-medium">{stockDetails.currency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">{stockDetails.active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Professional Stock Market Platform</h1>
              <p className="text-gray-600">Real-time stock data with interactive charts and detailed analysis</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🟢 Real-Time Data from Polygon API
                </span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                  Auto-refresh (30s)
                </label>
              </div>
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Status Message */}
        {renderApiStatusMessage()}

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search stocks by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchStocksForPage}
              disabled={loading || apiStatus !== 'configured'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Stock Chart */}
        {renderStockChart()}

        {/* Selected Stock Details */}
        {renderStockDetails()}

        {/* Stock Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              📊 Real-Time Stocks (Page {page} of {totalPages}) - Click any stock for detailed view
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading real-time stock data...</p>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {apiStatus === 'configured' 
                  ? 'No stocks found matching your search.' 
                  : 'Configure your API key to see real-time stock data.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock)}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    stock.error ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'
                  } ${selectedStock?.symbol === stock.symbol ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {stock.error ? (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 mb-1">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.error}</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-gray-900">{stock.symbol}</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeBgColor(stock.change)} ${getChangeColor(stock.change)}`}>
                          {formatChangePercent(stock.changePercent)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(stock.price)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Change:</span>
                          <span className={`text-sm font-semibold ${getChangeColor(stock.change)}`}>
                            {formatChange(stock.change)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Volume:</span>
                          <span className="text-sm text-gray-900">
                            {stock.volume || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Previous:</span>
                          <span className="text-sm text-gray-900">{formatPrice(stock.previousClose)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">High:</span>
                          <span className="text-sm text-gray-900">{formatPrice(stock.high)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Low:</span>
                          <span className="text-sm text-gray-900">{formatPrice(stock.low)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Updated:</span>
                          <span className="text-sm text-gray-900">{formatTime(stock.lastUpdated)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}