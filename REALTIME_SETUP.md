# 🚀 Get Real-Time Stock Data NOW!

## Step 1: Get Your Free API Key (2 minutes)

1. **Go to Alpha Vantage**: https://www.alphavantage.co/support/#api-key
2. **Click "Get Your Free API Key"**
3. **Fill out the form** (name, email, etc.)
4. **Copy your API key** (it looks like: `ABC123XYZ789`)

## Step 2: Update Your .env File

Edit the `.env` file in your project root:

```bash
# Current (wrong):
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Replace with your actual key:
ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_KEY_HERE
```

## Step 3: Start the Servers

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend  
npm start
```

## Step 4: Switch to Real Data

1. Open http://localhost:3000
2. Click the **"Real API"** button (instead of "Mock Data")
3. Click **"Refresh"** button

## You'll Get:
- ✅ **Real-time stock prices** from the market
- ✅ **Live price changes** and percentages
- ✅ **Actual trading volumes**
- ✅ **Real dates and times**
- ✅ **Current market data**

## API Limits:
- **Free tier**: 5 API calls per minute
- **Perfect for testing** and small apps
- **No credit card required**

## Troubleshooting:
- If you see "API key not configured" → Check your .env file
- If you see "rate limit exceeded" → Wait 1 minute and try again
- If data doesn't load → Make sure both servers are running

## Example .env file:
```
ALPHA_VANTAGE_API_KEY=ABC123XYZ789
```

**Get your key now and see real market data in 5 minutes!** 🎯 