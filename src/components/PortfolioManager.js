import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PortfolioManager = () => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState([]);
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [transactionType, setTransactionType] = useState('buy');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [searchSymbol, setSearchSymbol] = useState('');

    // Portfolio summary calculations
    const portfolioSummary = {
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        totalProfitPercent: 0,
        totalShares: 0
    };

    portfolio.forEach(holding => {
        const currentPrice = parseFloat(stockData[holding.symbol]?.price || holding.avg_price);
        const currentValue = currentPrice * holding.quantity;
        const costBasis = holding.avg_price * holding.quantity;
        const profit = currentValue - costBasis;
        const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;

        portfolioSummary.totalValue += currentValue;
        portfolioSummary.totalCost += costBasis;
        portfolioSummary.totalProfit += profit;
        portfolioSummary.totalShares += holding.quantity;
    });

    if (portfolioSummary.totalCost > 0) {
        portfolioSummary.totalProfitPercent = (portfolioSummary.totalProfit / portfolioSummary.totalCost) * 100;
    }

    // Fetch portfolio data
    const fetchPortfolio = async () => {
        try {
            const response = await axios.get('/api/portfolio');
            setPortfolio(response.data);
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
            setError('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    // Fetch stock data for portfolio
    const fetchStockData = async (symbols) => {
        if (!symbols || symbols.length === 0) return;
        
        try {
            const symbolsString = symbols.join(',');
            const response = await axios.get(`/api/stocks/batch?symbols=${symbolsString}`);
            const stockMap = {};
            response.data.forEach(stock => {
                stockMap[stock.symbol] = stock;
            });
            setStockData(stockMap);
        } catch (error) {
            console.error('Failed to fetch stock data:', error);
        }
    };

    // Buy stock
    const buyStock = async () => {
        if (!selectedStock || !quantity || !price) return;
        
        try {
            await axios.post('/api/portfolio/buy', {
                symbol: selectedStock.symbol,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                date: new Date().toISOString()
            });
            
            setShowBuyModal(false);
            setSelectedStock(null);
            setQuantity('');
            setPrice('');
            fetchPortfolio();
        } catch (error) {
            console.error('Failed to buy stock:', error);
            setError('Failed to buy stock');
        }
    };

    // Sell stock
    const sellStock = async () => {
        if (!selectedStock || !quantity || !price) return;
        
        try {
            await axios.post('/api/portfolio/sell', {
                symbol: selectedStock.symbol,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                date: new Date().toISOString()
            });
            
            setShowSellModal(false);
            setSelectedStock(null);
            setQuantity('');
            setPrice('');
            fetchPortfolio();
        } catch (error) {
            console.error('Failed to sell stock:', error);
            setError('Failed to sell stock');
        }
    };

    // Search stock for buying
    const searchStock = async () => {
        if (!searchSymbol.trim()) return;
        
        try {
            const response = await axios.get(`/api/stocks/live?symbol=${searchSymbol.toUpperCase()}`);
            setSelectedStock(response.data);
            setPrice(response.data.price);
            setShowBuyModal(true);
            setSearchSymbol('');
        } catch (error) {
            console.error('Failed to search stock:', error);
            setError('Stock not found');
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    useEffect(() => {
        if (portfolio.length > 0) {
            const symbols = portfolio.map(holding => holding.symbol);
            fetchStockData(symbols);
        }
    }, [portfolio]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercent = (percent) => {
        return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
    };

    const getProfitColor = (profit) => {
        return profit >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getProfitBgColor = (profit) => {
        return profit >= 0 ? 'bg-green-50' : 'bg-red-50';
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">💼 Portfolio Manager</h2>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Search stock (e.g., AAPL)"
                                value={searchSymbol}
                                onChange={(e) => setSearchSymbol(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={searchStock}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Buy Stock
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Portfolio Summary */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Total Value</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(portfolioSummary.totalValue)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Total Cost</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(portfolioSummary.totalCost)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Total Profit/Loss</p>
                            <p className={`text-xl font-bold ${getProfitColor(portfolioSummary.totalProfit)}`}>
                                {formatCurrency(portfolioSummary.totalProfit)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Profit %</p>
                            <p className={`text-xl font-bold ${getProfitColor(portfolioSummary.totalProfitPercent)}`}>
                                {formatPercent(portfolioSummary.totalProfitPercent)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Total Shares</p>
                            <p className="text-xl font-bold text-gray-900">
                                {portfolioSummary.totalShares.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Portfolio Holdings */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h3>
                    
                    {portfolio.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Your portfolio is empty</p>
                            <button
                                onClick={() => setShowBuyModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Buy Your First Stock
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Shares
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Current Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Market Value
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Profit/Loss
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {portfolio.map((holding) => {
                                        const currentPrice = parseFloat(stockData[holding.symbol]?.price || holding.avg_price);
                                        const marketValue = currentPrice * holding.quantity;
                                        const costBasis = holding.avg_price * holding.quantity;
                                        const profit = marketValue - costBasis;
                                        const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;

                                        return (
                                            <tr key={holding.symbol}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {holding.symbol}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {stockData[holding.symbol]?.name || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {holding.quantity.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(holding.avg_price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(currentPrice)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(marketValue)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-medium ${getProfitColor(profit)}`}>
                                                        {formatCurrency(profit)}
                                                    </div>
                                                    <div className={`text-xs ${getProfitColor(profitPercent)}`}>
                                                        {formatPercent(profitPercent)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStock({
                                                                symbol: holding.symbol,
                                                                currentPrice: currentPrice
                                                            });
                                                            setShowSellModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Sell
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Buy Stock Modal */}
            {showBuyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Buy Stock</h3>
                        {selectedStock && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedStock.symbol}</p>
                                <p className="text-sm text-gray-600">Current Price: {formatCurrency(selectedStock.price)}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Number of shares"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price per Share
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Price per share"
                                />
                            </div>
                            {quantity && price && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Total Cost: {formatCurrency(parseFloat(quantity) * parseFloat(price))}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-2 mt-6">
                            <button
                                onClick={buyStock}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Buy Stock
                            </button>
                            <button
                                onClick={() => setShowBuyModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sell Stock Modal */}
            {showSellModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Sell Stock</h3>
                        {selectedStock && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedStock.symbol}</p>
                                <p className="text-sm text-gray-600">Current Price: {formatCurrency(selectedStock.currentPrice)}</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity to Sell
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Number of shares"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price per Share
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Price per share"
                                />
                            </div>
                            {quantity && price && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Total Proceeds: {formatCurrency(parseFloat(quantity) * parseFloat(price))}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-2 mt-6">
                            <button
                                onClick={sellStock}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Sell Stock
                            </button>
                            <button
                                onClick={() => setShowSellModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioManager; 