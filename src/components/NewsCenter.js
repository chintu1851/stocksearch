import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Search, Clock, ExternalLink, TrendingUp, TrendingDown, Filter } from 'lucide-react';

const NewsCenter = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [newsCategory, setNewsCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stockNews, isLoading: newsLoading } = useQuery(
    ['stockNews', selectedStock],
    async () => {
      const response = await axios.get(`http://localhost:3001/api/stocks/news?symbol=${selectedStock}&limit=20`);
      return response.data;
    },
    {
      refetchInterval: 300000, // Refresh every 5 minutes
      staleTime: 240000,
    }
  );

  // Mock market news data
  const marketNews = [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Rate Cuts in 2024",
      description: "The Federal Reserve indicated today that it may consider interest rate reductions in the coming year as inflation continues to moderate.",
      author: "Financial Times",
      publishedUtc: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      articleUrl: "#",
      imageUrl: "https://via.placeholder.com/300x200",
      category: "market",
      sentiment: "positive"
    },
    {
      id: 2,
      title: "Tech Stocks Rally on Strong Earnings Reports",
      description: "Major technology companies reported better-than-expected earnings, driving a broad market rally.",
      author: "Wall Street Journal",
      publishedUtc: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      articleUrl: "#",
      imageUrl: "https://via.placeholder.com/300x200",
      category: "market",
      sentiment: "positive"
    },
    {
      id: 3,
      title: "Oil Prices Decline Amid Global Economic Concerns",
      description: "Crude oil prices fell today as traders weighed concerns about global economic growth and demand.",
      author: "Reuters",
      publishedUtc: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      articleUrl: "#",
      imageUrl: "https://via.placeholder.com/300x200",
      category: "market",
      sentiment: "negative"
    }
  ];

  const categories = [
    { id: 'all', name: 'All News', count: (stockNews?.news?.length || 0) + marketNews.length },
    { id: 'stock', name: 'Stock News', count: stockNews?.news?.length || 0 },
    { id: 'market', name: 'Market News', count: marketNews.length },
    { id: 'earnings', name: 'Earnings', count: 5 },
    { id: 'analyst', name: 'Analyst Reports', count: 3 }
  ];

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredNews = () => {
    let news = [];
    
    if (newsCategory === 'all' || newsCategory === 'stock') {
      news = news.concat(stockNews?.news || []);
    }
    
    if (newsCategory === 'all' || newsCategory === 'market') {
      news = news.concat(marketNews);
    }
    
    if (searchQuery) {
      news = news.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return news.sort((a, b) => new Date(b.publishedUtc) - new Date(a.publishedUtc));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📰 News Center</h1>
              <p className="text-gray-600">Latest financial news, market updates, and stock analysis</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock News</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setNewsCategory('stock')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Get News
            </button>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured News</h2>
            {newsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {filteredNews().slice(0, 1).map((article) => (
                  <div key={article.id} className="relative">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                          {getSentimentIcon(article.sentiment)}
                          <span className="ml-1 capitalize">{article.sentiment}</span>
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(article.publishedUtc)}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-4">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">By {article.author}</span>
                        <a
                          href={article.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                          Read More
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* News List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest News</h2>
            <div className="space-y-4">
              {filteredNews().slice(1).map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                          {getSentimentIcon(article.sentiment)}
                          <span className="ml-1 capitalize">{article.sentiment}</span>
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(article.publishedUtc)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-3">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">By {article.author}</span>
                        <a
                          href={article.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                          Read More
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">News Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setNewsCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  newsCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{category.count}</div>
                  <div className="text-sm text-gray-600">{category.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCenter; 