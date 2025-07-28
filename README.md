# 📈 Stock Market Dashboard

A professional, real-time stock market dashboard built with React, Node.js, and Tailwind CSS. Get live stock prices, market data, and professional analytics in a beautiful, responsive interface.

![Stock Dashboard](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## ✨ Features

- 🔴 **Real-time Stock Data** - Live prices from Alpha Vantage API
- 📊 **Professional Dashboard** - Clean, modern UI with Tailwind CSS
- 🔍 **Search & Filter** - Find stocks by symbol instantly
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Auto-refresh** - Updates every 60 seconds automatically
- 📄 **Pagination** - Browse through 80+ popular stocks
- 🎯 **Smart Caching** - Optimized API calls with intelligent caching
- 🚀 **Production Ready** - Deploy to Vercel, Netlify, or any hosting platform

## 🚀 Quick Start

### 1. Get Your API Key (2 minutes)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Click "Get Your Free API Key"
3. Fill out the form and copy your key

### 2. Configure Environment
Edit `.env` file in the project root:
```env
ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Install & Run
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start backend server
cd server && npm run dev

# Start frontend (new terminal)
npm start
```

### 4. View Dashboard
Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for external APIs
- **CORS** - Cross-origin resource sharing

### APIs
- **Alpha Vantage** - Real-time stock data
- **Rate Limiting** - 5 calls per minute (free tier)
- **Smart Caching** - 1-minute cache for performance

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stocks/live` | GET | Single stock data |
| `/api/stocks/batch` | GET | Multiple stocks data |
| `/api/stocks/cache` | GET | Cache status |

### Example Usage
```bash
# Get single stock
curl "http://localhost:3001/api/stocks/live?symbol=AAPL"

# Get multiple stocks
curl "http://localhost:3001/api/stocks/batch?symbols=AAPL,GOOGL,MSFT"

# Check cache status
curl "http://localhost:3001/api/stocks/cache"
```

## 🎨 UI Features

### Stock Cards
- **Symbol & Price** - Clear, prominent display
- **Change Indicators** - Green/red color coding
- **Volume & Date** - Complete market information
- **Hover Effects** - Interactive user experience

### Dashboard Controls
- **Search Bar** - Filter stocks by symbol
- **Auto-refresh Toggle** - Enable/disable automatic updates
- **Manual Refresh** - Instant data update button
- **Pagination** - Navigate through stock pages

### Status Indicators
- **API Status** - Real-time connection status
- **Loading States** - Smooth loading animations
- **Error Handling** - Clear error messages
- **Success Feedback** - Confirmation of actions

## 🔧 Configuration

### Environment Variables
```env
# Required
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Optional
PORT=3001
NODE_ENV=development
```

### API Limits
- **Free Tier**: 5 API calls per minute
- **Cache Duration**: 1 minute
- **Rate Limiting**: 12 seconds between calls
- **Timeout**: 10 seconds per request

## 📱 Mobile Support

The dashboard is fully responsive and optimized for:
- 📱 **Mobile phones** (320px+)
- 📱 **Tablets** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large screens** (1440px+)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
ALPHA_VANTAGE_API_KEY=your_key_here

# Deploy server folder
```

## 🐛 Troubleshooting

### Common Issues

**"API key not configured"**
- Check your `.env` file
- Ensure API key is correct
- Restart the server

**"Rate limit exceeded"**
- Wait 1 minute before retrying
- Reduce number of simultaneous requests
- Check API usage limits

**"Server connection error"**
- Ensure backend is running on port 3001
- Check for port conflicts
- Verify CORS configuration

**"Loading forever"**
- Check browser console for errors
- Verify API key is valid
- Check network connectivity

### Debug Mode
Enable debug logging in the browser console to see detailed API calls and responses.

## 📈 Performance

- **Initial Load**: < 2 seconds
- **API Response**: < 1 second (cached)
- **Auto-refresh**: Every 60 seconds
- **Search**: Instant filtering
- **Pagination**: Smooth navigation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for providing the stock data API
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI framework
- [React](https://reactjs.org/) for the amazing frontend framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API Setup Guide](API_SETUP.md)
3. Open an issue on GitHub

---

**Ready to see real-time stock data? Get your API key and start trading! 🚀**
