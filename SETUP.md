# Stock Search App Setup Guide

## Issues Fixed:
1. ✅ Added missing dependencies (express, cors, axios) to server/package.json
2. ✅ Fixed duplicate route imports in server/index.js
3. ✅ Resolved port conflicts (backend: 3001, frontend: 3000)
4. ✅ Created .env file template
5. ✅ Fixed getBatchStocks function in stockControllers.js
6. ✅ Cleaned up routes file

## Setup Instructions:

### 1. Environment Variables
Edit the `.env` file in the root directory:
```env
# Database Configuration (if using PostgreSQL)
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# Alpha Vantage API Key (Get free key from https://www.alphavantage.co/support/#api-key)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Server Port
PORT=3001
```

### 2. Get Alpha Vantage API Key
1. Go to https://www.alphavantage.co/support/#api-key
2. Sign up for a free account
3. Get your API key
4. Add it to the .env file

### 3. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 4. Start the Application
```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the frontend
npm start
```

### 5. Test the API
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Endpoints:
  - Single stock: http://localhost:3001/api/stocks/live?symbol=AAPL
  - Batch stocks: http://localhost:3001/api/stocks/batch?symbols=AAPL,GOOGL,MSFT

## Current Status:
- ✅ Backend server should start without errors
- ✅ Frontend should connect to backend
- ✅ API endpoints are properly configured
- ⚠️ You need to add your Alpha Vantage API key to .env
- ⚠️ Database connection is optional (only needed if you want to store data)

## Troubleshooting:
1. If you get "API key not found" errors, make sure you've added your Alpha Vantage API key to .env
2. If the frontend can't connect to backend, make sure both servers are running on the correct ports
3. If you get CORS errors, the CORS configuration is already set up correctly 