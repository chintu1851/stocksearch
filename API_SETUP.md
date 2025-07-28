# 🔑 API Key Setup Required

## The Issue
Your app is not showing data because the Alpha Vantage API key is not configured.

## How to Fix

### 1. Get Your API Key
1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key (it's free!)

### 2. Update Your .env File
Edit the `.env` file in your project root and replace:
```
ALPHA_VANTAGE_API_KEY=your_api_key_here
```
with:
```
ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Restart the Server
After updating the .env file, restart your server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd server && npm run dev
```

### 4. Test
Your app should now show real stock data!

## Example
If your API key is `ABC123XYZ`, your .env file should look like:
```
ALPHA_VANTAGE_API_KEY=ABC123XYZ
```

## Need Help?
- The API key is completely free
- You get 5 API calls per minute (perfect for testing)
- No credit card required 