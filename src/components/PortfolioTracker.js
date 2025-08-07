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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Percent, PieChart as PieChartIcon, Buy, Sell, AlertCircle } from 'lucide-react';
import { usePortfolio, portfolioService, formatCurrency, formatPercentage, getChangeColor, getChangeBgColor } from '../services/stockService';

const PortfolioTracker = () => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [transactionData, setTransactionData] = useState({
    symbol: '',
    shares: '',
    price: ''
  });
  const [notification, setNotification] = useState(null);

  const { portfolio, loading, error } = usePortfolio();

  // Get current stock prices for portfolio stocks
  const { data: stockData, isLoading: stockLoading } = useQuery(
    ['portfolioStocks', portfolio?.stocks],
    async () => {
      if (!portfolio?.stocks || portfolio.stocks.length === 0) return [];
      
      const symbols = portfolio.stocks.map(s => s.symbol);
      const response = await axios.get(`http://localhost:3001/api/stocks/batch?symbols=${symbols.join(',')}`);
      return response.data;
    },
    {
      refetchInterval: 30000,
      staleTime: 25000,
      enabled: !!portfolio?.stocks
    }
  );

  const handleBuyStock = async () => {
    try {
      if (!transactionData.symbol || !transactionData.shares || !transactionData.price) {
        setNotification({ type: 'error', message: 'Please fill in all fields' });
        return;
      }

      const response = await portfolioService.buyStock(
        transactionData.symbol,
        parseInt(transactionData.shares),
        parseFloat(transactionData.price)
      );

      setNotification({ type: 'success', message: 'Stock purchased successfully!' });
      setShowBuyModal(false);
      setTransactionData({ symbol: '', shares: '', price: '' });
      
      // Refresh portfolio data
      window.location.reload();
    } catch (error) {
      setNotification({ type: 'error', message: error.response?.data?.error || 'Failed to buy stock' });
    }
  };

  const handleSellStock = async () => {
    try {
      if (!transactionData.symbol || !transactionData.shares || !transactionData.price) {
        setNotification({ type: 'error', message: 'Please fill in all fields' });
        return;
      }

      const response = await portfolioService.sellStock(
        transactionData.symbol,
        parseInt(transactionData.shares),
        parseFloat(transactionData.price)
      );

      setNotification({ type: 'success', message: 'Stock sold successfully!' });
      setShowSellModal(false);
      setTransactionData({ symbol: '', shares: '', price: '' });
      
      // Refresh portfolio data
      window.location.reload();
    } catch (error) {
      setNotification({ type: 'error', message: error.response?.data?.error || 'Failed to sell stock' });
    }
  };

  const openBuyModal = (stock = null) => {
    if (stock) {
      setTransactionData({
        symbol: stock.symbol,
        shares: '',
        price: stock.currentPrice || ''
      });
    } else {
      setTransactionData({ symbol: '', shares: '', price: '' });
    }
    setShowBuyModal(true);
  };

  const openSellModal = (stock) => {
    setSelectedStock(stock);
    setTransactionData({
      symbol: stock.symbol,
      shares: '',
      price: stock.currentPrice || stock.avgPrice || ''
    });
    setShowSellModal(true);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // Calculate updated portfolio data with real-time prices
  const getUpdatedPortfolio = () => {
    if (!portfolio || !stockData) return portfolio;

    const updatedStocks = portfolio.stocks.map(stock => {
      const currentStock = stockData.find(s => s.symbol === stock.symbol);
      if (currentStock && currentStock.price !== 'N/A') {
        const currentPrice = parseFloat(currentStock.price);
        const totalValue = stock.shares * currentPrice;
        const gainLoss = totalValue - (stock.shares * stock.avgPrice);
        const gainLossPercent = stock.avgPrice > 0 ? (gainLoss / (stock.shares * stock.avgPrice)) * 100 : 0;

        return {
          ...stock,
          currentPrice: currentPrice,
          totalValue: totalValue,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent
        };
      }
      return stock;
    });

    const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.totalValue, 0);
    const totalCost = updatedStocks.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      ...portfolio,
      stocks: updatedStocks,
      totalValue: totalValue,
      totalCost: totalCost,
      totalGainLoss: totalGainLoss,
      totalGainLossPercent: totalGainLossPercent
    };
  };

  const updatedPortfolio = getUpdatedPortfolio();

  // Prepare data for charts
  const allocationData = updatedPortfolio?.stocks.map(stock => ({
    name: stock.symbol,
    value: stock.totalValue,
    shares: stock.shares,
    avgPrice: stock.avgPrice
  })).filter(item => item.value > 0) || [];

  const performanceData = [
    { name: 'AAPL', gainLoss: 255.00, gainLossPercent: 17.00 },
    { name: 'GOOGL', gainLoss: 750.00, gainLossPercent: 5.36 },
    { name: 'MSFT', gainLoss: 200.00, gainLossPercent: 8.33 },
    { name: 'TSLA', gainLoss: -150.00, gainLossPercent: -6.25 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading portfolio</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💼 Portfolio Tracker</h1>
              <p className="text-gray-600">Track your investments and manage your portfolio</p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <button
                onClick={() => openBuyModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
              >
                <Buy className="h-4 w-4" />
                <span>Buy Stock</span>
              </button>
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

        {/* Portfolio Overview */}
        {updatedPortfolio && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(updatedPortfolio.totalValue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(updatedPortfolio.totalCost)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gain/Loss</p>
                  <p className={`text-2xl font-bold ${getChangeColor(updatedPortfolio.totalGainLoss)}`}>
                    {formatCurrency(updatedPortfolio.totalGainLoss)}
                  </p>
                </div>
                {updatedPortfolio.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Return</p>
                  <p className={`text-2xl font-bold ${getChangeColor(updatedPortfolio.totalGainLossPercent)}`}>
                    {formatPercentage(updatedPortfolio.totalGainLossPercent)}
                  </p>
                </div>
                <Percent className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Holdings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Portfolio Holdings</h2>
            <div className="flex items-center space-x-2">
              {stockLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Updating prices...
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {updatedPortfolio?.stocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.shares}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.avgPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.currentPrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.totalValue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${getChangeColor(stock.gainLoss)}`}>
                          {formatCurrency(stock.gainLoss)}
                        </span>
                        <span className={`text-xs ${getChangeColor(stock.gainLossPercent)}`}>
                          {formatPercentage(stock.gainLossPercent)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openBuyModal(stock)}
                          className="text-green-600 hover:text-green-900 text-xs"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => openSellModal(stock)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portfolio Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance by Stock</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatCurrency(value), 'Gain/Loss']} />
                <Bar dataKey="gainLoss" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buy Stock Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Buy Stock</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Symbol</label>
                    <input
                      type="text"
                      value={transactionData.symbol}
                      onChange={(e) => setTransactionData({...transactionData, symbol: e.target.value.toUpperCase()})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AAPL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shares</label>
                    <input
                      type="number"
                      value={transactionData.shares}
                      onChange={(e) => setTransactionData({...transactionData, shares: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Share</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionData.price}
                      onChange={(e) => setTransactionData({...transactionData, price: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuyStock}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Buy Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sell Stock Modal */}
        {showSellModal && selectedStock && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sell {selectedStock.symbol}</h3>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Available shares: {selectedStock.shares}</p>
                  <p className="text-sm text-gray-600">Average price: {formatCurrency(selectedStock.avgPrice)}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shares to Sell</label>
                    <input
                      type="number"
                      max={selectedStock.shares}
                      value={transactionData.shares}
                      onChange={(e) => setTransactionData({...transactionData, shares: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Share</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionData.price}
                      onChange={(e) => setTransactionData({...transactionData, price: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="175.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSellStock}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Sell Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTracker; 