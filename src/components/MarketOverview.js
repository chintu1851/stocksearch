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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Globe, DollarSign, BarChart3 } from 'lucide-react';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Major market indices
  const majorIndices = [
    { symbol: 'SPY', name: 'S&P 500', description: 'Large-cap US stocks' },
    { symbol: 'QQQ', name: 'NASDAQ 100', description: 'Technology stocks' },
    { symbol: 'DIA', name: 'Dow Jones', description: 'Blue-chip stocks' },
    { symbol: 'IWM', name: 'Russell 2000', description: 'Small-cap stocks' },
    { symbol: 'EFA', name: 'MSCI EAFE', description: 'International stocks' },
    { symbol: 'AGG', name: 'US Bonds', description: 'Fixed income' }
  ];

  // Sector performance data (mock data for demonstration)
  const sectorData = [
    { name: 'Technology', value: 12.5, change: 2.3, color: '#3B82F6' },
    { name: 'Healthcare', value: 8.2, change: -1.1, color: '#10B981' },
    { name: 'Financials', value: 6.8, change: 0.8, color: '#F59E0B' },
    { name: 'Consumer Discretionary', value: 5.4, change: 1.2, color: '#EF4444' },
    { name: 'Industrials', value: 4.9, change: -0.5, color: '#8B5CF6' },
    { name: 'Energy', value: 3.2, change: -2.1, color: '#F97316' },
    { name: 'Consumer Staples', value: 2.8, change: 0.3, color: '#06B6D4' },
    { name: 'Materials', value: 2.1, change: 0.7, color: '#84CC16' }
  ];

  const { data: indicesData, isLoading: indicesLoading } = useQuery(
    'marketIndices',
    async () => {
      const symbols = majorIndices.map(index => index.symbol).join(',');
      const response = await axios.get(`http://localhost:3001/api/stocks/batch?symbols=${symbols}`);
      return response.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      staleTime: 25000,
    }
  );

  const { data: marketStatus } = useQuery(
    'marketStatus',
    async () => {
      const response = await axios.get('http://localhost:3001/api/stocks/market');
      return response.data;
    },
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  const formatPrice = (price) => {
    if (!price || price === 'N/A') return 'N/A';
    const numPrice = parseFloat(price);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Market Overview</h1>
              <p className="text-gray-600">Real-time market data, indices, and sector performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  {marketStatus?.market === 'open' ? 'Market Open' : 'Market Closed'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Market Status */}
        {marketStatus && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Market</p>
                  <p className="font-semibold">{marketStatus.market}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Server Time</p>
                  <p className="font-semibold">{new Date(marketStatus.serverTime).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Exchanges</p>
                  <p className="font-semibold">{marketStatus.exchanges?.length || 0} Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Major Indices */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Major Market Indices</h2>
          {indicesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicesData?.map((index, idx) => {
                const indexInfo = majorIndices[idx];
                return (
                  <div key={index.symbol} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{indexInfo.name}</h3>
                        <p className="text-sm text-gray-600">{indexInfo.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeBgColor(index.change)} ${getChangeColor(index.change)}`}>
                        {formatChangePercent(index.changePercent)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="text-sm font-semibold">{formatPrice(index.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Change:</span>
                        <span className={`text-sm font-semibold ${getChangeColor(index.change)}`}>
                          {formatChange(index.change)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Volume:</span>
                        <span className="text-sm text-gray-900">{index.volume || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sector Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Allocation</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sectorData.map((sector) => (
                  <tr key={sector.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: sector.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{sector.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sector.value}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${sector.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sector.change >= 0 ? '+' : ''}{sector.change}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sector.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview; 