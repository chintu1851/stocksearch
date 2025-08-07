import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Star, StarOff, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercentage, getChangeColor } from '../services/stockService';

const WatchlistManager = () => {
    // Mock watchlist data for demo
    const [watchlists, setWatchlists] = useState([
        {
            id: 1,
            name: 'My Watchlist',
            description: 'My main watchlist',
            stocks: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
        },
        {
            id: 2,
            name: 'Tech Stocks',
            description: 'Technology sector stocks',
            stocks: ['NVDA', 'META', 'NFLX', 'AMD', 'INTC']
        }
    ]);
    
    const [activeWatchlist, setActiveWatchlist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [newStockSymbol, setNewStockSymbol] = useState('');
    const [stockData, setStockData] = useState({});
    const [showAddWatchlist, setShowAddWatchlist] = useState(false);
    const [showAddStock, setShowAddStock] = useState(false);

    // Mock stock data
    const mockStockData = {
        'AAPL': { symbol: 'AAPL', price: 175.50, change: 2.50, changePercent: 1.44, volume: 45000000 },
        'GOOGL': { symbol: 'GOOGL', price: 2950.00, change: 15.00, changePercent: 0.51, volume: 1200000 },
        'MSFT': { symbol: 'MSFT', price: 325.00, change: -1.50, changePercent: -0.46, volume: 28000000 },
        'TSLA': { symbol: 'TSLA', price: 750.00, change: 25.00, changePercent: 3.45, volume: 35000000 },
        'AMZN': { symbol: 'AMZN', price: 145.00, change: 3.00, changePercent: 2.11, volume: 42000000 },
        'NVDA': { symbol: 'NVDA', price: 450.00, change: 12.00, changePercent: 2.74, volume: 25000000 },
        'META': { symbol: 'META', price: 320.00, change: -5.00, changePercent: -1.54, volume: 18000000 },
        'NFLX': { symbol: 'NFLX', price: 480.00, change: 8.00, changePercent: 1.69, volume: 8000000 },
        'AMD': { symbol: 'AMD', price: 120.00, change: 3.50, changePercent: 3.01, volume: 35000000 },
        'INTC': { symbol: 'INTC', price: 45.00, change: -0.50, changePercent: -1.10, volume: 22000000 }
    };

    useEffect(() => {
        setStockData(mockStockData);
        if (watchlists.length > 0 && !activeWatchlist) {
            setActiveWatchlist(watchlists[0]);
        }
    }, [watchlists]);

    // Create new watchlist
    const createWatchlist = async () => {
        if (!newWatchlistName.trim()) return;
        
        const newWatchlist = {
            id: Date.now(),
            name: newWatchlistName,
            description: `Watchlist created by user`,
            stocks: []
        };
        
        setWatchlists([...watchlists, newWatchlist]);
        setNewWatchlistName('');
        setShowAddWatchlist(false);
    };

    // Add stock to watchlist
    const addStockToWatchlist = async () => {
        if (!newStockSymbol.trim() || !activeWatchlist) return;
        
        const symbol = newStockSymbol.toUpperCase();
        if (!activeWatchlist.stocks.includes(symbol)) {
            const updatedWatchlist = {
                ...activeWatchlist,
                stocks: [...activeWatchlist.stocks, symbol]
            };
            
            setWatchlists(watchlists.map(w => w.id === activeWatchlist.id ? updatedWatchlist : w));
            setActiveWatchlist(updatedWatchlist);
        }
        
        setNewStockSymbol('');
        setShowAddStock(false);
    };

    // Remove stock from watchlist
    const removeStockFromWatchlist = async (symbol) => {
        if (!activeWatchlist) return;
        
        const updatedWatchlist = {
            ...activeWatchlist,
            stocks: activeWatchlist.stocks.filter(s => s !== symbol)
        };
        
        setWatchlists(watchlists.map(w => w.id === activeWatchlist.id ? updatedWatchlist : w));
        setActiveWatchlist(updatedWatchlist);
    };

    // Delete watchlist
    const deleteWatchlist = async (watchlistId) => {
        setWatchlists(watchlists.filter(w => w.id !== watchlistId));
        if (activeWatchlist && activeWatchlist.id === watchlistId) {
            setActiveWatchlist(watchlists.length > 1 ? watchlists.find(w => w.id !== watchlistId) : null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">⭐ Watchlist Manager</h1>
                            <p className="text-gray-600">Organize and track your favorite stocks</p>
                        </div>
                        <button
                            onClick={() => setShowAddWatchlist(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Watchlist</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Watchlist Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Watchlists</h2>
                            
                            <div className="space-y-2">
                                {watchlists.map((watchlist) => (
                                    <button
                                        key={watchlist.id}
                                        onClick={() => setActiveWatchlist(watchlist)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            activeWatchlist?.id === watchlist.id
                                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{watchlist.name}</h3>
                                                <p className="text-sm text-gray-600">{watchlist.stocks.length} stocks</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteWatchlist(watchlist.id);
                                                }}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Watchlist Content */}
                    <div className="lg:col-span-3">
                        {activeWatchlist ? (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{activeWatchlist.name}</h2>
                                        <p className="text-gray-600">{activeWatchlist.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddStock(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Stock</span>
                                    </button>
                                </div>

                                {/* Stocks Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {activeWatchlist.stocks.map((symbol) => {
                                                const stock = stockData[symbol];
                                                return (
                                                    <tr key={symbol} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="text-sm font-medium text-gray-900">{symbol}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {stock ? formatCurrency(stock.price) : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {stock ? (
                                                                <div className="flex items-center space-x-1">
                                                                    {stock.change >= 0 ? (
                                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                    <span className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                                                                        {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                'N/A'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {stock ? stock.volume.toLocaleString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => removeStockFromWatchlist(symbol)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="text-center py-12">
                                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Watchlist Selected</h3>
                                    <p className="text-gray-600">Select a watchlist from the sidebar to view stocks</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Watchlist Modal */}
                {showAddWatchlist && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Watchlist</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Watchlist Name</label>
                                        <input
                                            type="text"
                                            value={newWatchlistName}
                                            onChange={(e) => setNewWatchlistName(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter watchlist name"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAddWatchlist(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createWatchlist}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Stock Modal */}
                {showAddStock && activeWatchlist && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Stock to {activeWatchlist.name}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Stock Symbol</label>
                                        <input
                                            type="text"
                                            value={newStockSymbol}
                                            onChange={(e) => setNewStockSymbol(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter stock symbol (e.g., AAPL)"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAddStock(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addStockToWatchlist}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Add Stock
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

export default WatchlistManager; 