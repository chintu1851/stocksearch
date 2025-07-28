# 📁 Stock Market Dashboard - Project Structure

## 🗂️ Root Directory Structure

```
stocksearch/
├── 📄 .env                          # Environment variables (API keys, config)
├── 📄 .gitignore                    # Git ignore rules
├── 📄 package.json                  # Frontend dependencies
├── 📄 package-lock.json             # Frontend dependency lock
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 postcss.config.js             # PostCSS configuration
├── 📄 README.md                     # Project documentation
├── 📄 SETUP.md                      # Setup instructions
├── 📄 REALTIME_SETUP.md             # Real-time data setup
├── 📄 API_SETUP.md                  # API key setup guide
├── 📄 PROJECT_STRUCTURE.md          # This file
├── 📄 test-api.js                   # API testing script
│
├── 📁 public/                       # Static files
│   ├── 📄 index.html               # Main HTML file
│   ├── 📄 favicon.ico              # Website icon
│   ├── 📄 manifest.json            # PWA manifest
│   └── 📄 robots.txt               # SEO robots file
│
├── 📁 src/                          # Frontend source code
│   ├── 📄 index.js                 # React entry point
│   ├── 📄 index.css                # Global styles + Tailwind
│   ├── 📄 App.js                   # Main React component
│   ├── 📄 App.css                  # App-specific styles
│   └── 📁 client/                  # React components
│       └── 📄 Stockcollection.js   # Main stock dashboard component
│
└── 📁 server/                       # Backend server
    ├── 📄 package.json             # Backend dependencies
    ├── 📄 package-lock.json        # Backend dependency lock
    ├── 📄 index.js                 # Main server file
    ├── 📁 config/                  # Configuration files
    │   └── 📄 db.js               # Database configuration
    ├── 📁 controllers/             # API controllers
    │   └── 📄 stockControllers.js # Stock data API logic
    ├── 📁 models/                  # Database models
    │   └── 📄 stockModel.js       # Stock data model
    └── 📁 routes/                  # API routes
        └── 📄 stockApiRoutes.js   # Stock API endpoints
```

## 🔧 Key Files Explained

### Frontend Files
- **`src/client/Stockcollection.js`** - Main dashboard component with real-time data
- **`src/App.js`** - Root React component
- **`src/index.css`** - Global styles with Tailwind CSS
- **`tailwind.config.js`** - Tailwind CSS configuration

### Backend Files
- **`server/index.js`** - Express server setup
- **`server/controllers/stockControllers.js`** - API logic for stock data
- **`server/routes/stockApiRoutes.js`** - API endpoint definitions

### Configuration Files
- **`.env`** - Environment variables (API keys, ports)
- **`package.json`** - Project dependencies and scripts

## 🚀 How to Run the Project

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Set Up Environment Variables
Edit `.env` file and add your Alpha Vantage API key:
```env
ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Start the Servers
```bash
# Terminal 1: Start backend server
cd server && npm run dev

# Terminal 2: Start frontend
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📊 API Endpoints

- **Single Stock**: `GET /api/stocks/live?symbol=AAPL`
- **Batch Stocks**: `GET /api/stocks/batch?symbols=AAPL,GOOGL,MSFT`
- **Cache Status**: `GET /api/stocks/cache`

## 🎯 Features

### Frontend Features
- ✅ Real-time stock data display
- ✅ Search functionality
- ✅ Pagination (15 stocks per page)
- ✅ Auto-refresh (60 seconds)
- ✅ Professional UI with Tailwind CSS
- ✅ Mobile responsive design
- ✅ Mock data mode for testing

### Backend Features
- ✅ Alpha Vantage API integration
- ✅ Rate limiting (12 seconds between calls)
- ✅ Caching (2 minutes)
- ✅ Error handling
- ✅ CORS configuration

## 🔑 Getting Real-Time Data

1. **Get API Key**: https://www.alphavantage.co/support/#api-key
2. **Update .env**: Replace `your_api_key_here` with your key
3. **Restart Server**: `cd server && npm run dev`
4. **Switch Mode**: Click "Real API" in the app

## 📱 Deployment Ready

The project is structured for easy deployment to:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, Railway, or any Node.js hosting

## 🛠️ Development

- **Frontend**: React 19 + Tailwind CSS
- **Backend**: Node.js + Express
- **API**: Alpha Vantage (real-time stock data)
- **Database**: PostgreSQL (optional, for future features) 