# ⚡ Quick Start Guide

## 🎯 Get Real-Time Stock Data in 5 Minutes

### Step 1: Get Your API Key (2 minutes)
1. Go to: **https://www.alphavantage.co/support/#api-key**
2. Click "Get Your Free API Key"
3. Fill out the form (name, email, etc.)
4. Copy your API key (looks like: `ABC123XYZ789`)

### Step 2: Update Your .env File
Edit the `.env` file in your project root and replace:
```env
ALPHA_VANTAGE_API_KEY=your_api_key_here
```
with your actual key:
```env
ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_KEY_HERE
```

### Step 3: Start the Application
```bash
# Terminal 1: Start backend server
cd server && npm run dev

# Terminal 2: Start frontend
npm start
```

### Step 4: View Real-Time Data
1. Open: **http://localhost:3000**
2. Click **"Refresh"** button
3. See **real-time stock data** from the market!

## ✅ What You'll Get

- **Live stock prices** from current market
- **Real price changes** and percentages  
- **Actual trading volumes**
- **Current dates and times**
- **Professional dashboard** with search and pagination

## 🔧 Project Structure

```
stocksearch/
├── .env                    # ← Edit this file with your API key
├── src/client/Stockcollection.js  # Main dashboard component
├── server/controllers/stockControllers.js  # API logic
└── server/index.js        # Backend server
```

## 📊 API Endpoints

- **Single Stock**: `GET /api/stocks/live?symbol=AAPL`
- **Batch Stocks**: `GET /api/stocks/batch?symbols=AAPL,GOOGL,MSFT`

## 🚨 Troubleshooting

- **"API key not configured"** → Check your .env file
- **"Rate limit exceeded"** → Wait 1 minute and try again
- **Port conflicts** → Kill existing processes and restart

## 📱 Features

- ✅ Real-time data from Alpha Vantage API
- ✅ Professional UI with Tailwind CSS
- ✅ Search and pagination
- ✅ Auto-refresh every 60 seconds
- ✅ Mobile responsive design
- ✅ Mock data mode for testing

## 🎉 Ready to Deploy

The app is production-ready and can be deployed to:
- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway

**Get your API key now and see real market data!** 🚀 