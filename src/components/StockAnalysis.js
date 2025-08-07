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
  AreaChart,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { Search, TrendingUp, TrendingDown, BarChart3, Calculator, Target, AlertTriangle } from 'lucide-react';

const StockAnalysis = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1M');
  const [analysisType, setAnalysisType] = useState('technical');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stockData, isLoading: stockLoading } = useQuery(
    ['stockData', selectedStock],
    async () => {
      const response = await axios.get(`http://localhost:3001/api/stocks/live?symbol=${selectedStock}`);
      return response.data;
    },
    {
      refetchInterval: 30000,
      staleTime: 25000,
    }
  );

  const { data: chartData, isLoading: chartLoading } = useQuery(
    ['chartData', selectedStock, timeframe],
    async () => {
      const response = await axios.get(`http://localhost:3001/api/stocks/chart?symbol=${selectedStock}&timeframe=${timeframe}`);
      return response.data;
    },
    {
      refetchInterval: 60000,
      staleTime: 50000,
    }
  );

  const { data: stockDetails } = useQuery(
    ['stockDetails', selectedStock],
    async () => {
      const response = await axios.get(`http://localhost:3001/api/stocks/details?symbol=${selectedStock}`);
      return response.data;
    }
  );

  // Mock technical indicators data
  const technicalIndicators = {
    rsi: 65.4,
    macd: 0.23,
    bollingerUpper: 185.50,
    bollingerLower: 175.20,
    sma20: 180.35,
    sma50: 178.90,
    volumeSMA: 1250000
  };

  // Mock fundamental data
  const fundamentalData = {
    peRatio: 25.6,
    pbRatio: 3.2,
    debtToEquity: 0.15,
    returnOnEquity: 0.18,
    profitMargin: 0.22,
    revenueGrowth: 0.12,
    earningsGrowth: 0.15,
    dividendYield: 0.008
  };

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

  const getRSIColor = (rsi) => {
    if (rsi > 70) return 'text-red-600';
    if (rsi < 30) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getSignal = (rsi, macd) => {
    if (rsi > 70 && macd < 0) return 'Sell';
    if (rsi < 30 && macd > 0) return 'Buy';
    return 'Hold';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Stock Analysis</h1>
              <p className="text-gray-600">Advanced technical and fundamental analysis tools</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setSelectedStock(searchQuery.toUpperCase())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        {stockData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h2>
                <p className="text-gray-600">{stockDetails?.name || 'Loading...'}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{formatPrice(stockData.price)}</div>
                <div className={`text-lg font-semibold ${getChangeColor(stockData.change)}`}>
                  {formatChange(stockData.change)} ({formatChangePercent(stockData.changePercent)})
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="font-semibold">{formatPrice(stockData.open)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">High</p>
                <p className="font-semibold">{formatPrice(stockData.high)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Low</p>
                <p className="font-semibold">{formatPrice(stockData.low)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Volume</p>
                <p className="font-semibold">{stockData.volume}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Type Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setAnalysisType('technical')}
              className={`px-4 py-2 rounded-md font-medium ${
                analysisType === 'technical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Technical Analysis
            </button>
            <button
              onClick={() => setAnalysisType('fundamental')}
              className={`px-4 py-2 rounded-md font-medium ${
                analysisType === 'fundamental'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fundamental Analysis
            </button>
          </div>

          {analysisType === 'technical' ? (
            <div className="space-y-6">
              {/* Chart */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
                  <div className="flex space-x-2">
                    {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 text-sm rounded ${
                          timeframe === tf
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                
                {chartLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={chartData?.data || []}>
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
                        {chartData?.data?.map((item, index) => item.sma20 && (
                          <Line
                            key={`sma20-${index}`}
                            type="monotone"
                            dataKey="sma20"
                            stroke="#ef4444"
                            strokeWidth={1}
                            dot={false}
                          />
                        ))}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Technical Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Technical Indicators</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RSI (14):</span>
                      <span className={`font-semibold ${getRSIColor(technicalIndicators.rsi)}`}>
                        {technicalIndicators.rsi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MACD:</span>
                      <span className={`font-semibold ${technicalIndicators.macd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {technicalIndicators.macd}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SMA (20):</span>
                      <span className="font-semibold">${technicalIndicators.sma20}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SMA (50):</span>
                      <span className="font-semibold">${technicalIndicators.sma50}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Trading Signal</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signal:</span>
                      <span className={`font-semibold ${
                        getSignal(technicalIndicators.rsi, technicalIndicators.macd) === 'Buy' ? 'text-green-600' :
                        getSignal(technicalIndicators.rsi, technicalIndicators.macd) === 'Sell' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {getSignal(technicalIndicators.rsi, technicalIndicators.macd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Strength:</span>
                      <span className="font-semibold">Medium</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold">75%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Fundamental Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">P/E Ratio</h4>
                  <p className="text-2xl font-bold text-gray-900">{fundamentalData.peRatio}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">P/B Ratio</h4>
                  <p className="text-2xl font-bold text-gray-900">{fundamentalData.pbRatio}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">ROE</h4>
                  <p className="text-2xl font-bold text-gray-900">{(fundamentalData.returnOnEquity * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Dividend Yield</h4>
                  <p className="text-2xl font-bold text-gray-900">{(fundamentalData.dividendYield * 100).toFixed(2)}%</p>
                </div>
              </div>

              {/* Growth Metrics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Revenue Growth</p>
                    <p className="text-lg font-semibold text-green-600">+{(fundamentalData.revenueGrowth * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Earnings Growth</p>
                    <p className="text-lg font-semibold text-green-600">+{(fundamentalData.earningsGrowth * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p className="text-lg font-semibold text-gray-900">{(fundamentalData.profitMargin * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Debt/Equity</p>
                    <p className="text-lg font-semibold text-gray-900">{fundamentalData.debtToEquity}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis; 