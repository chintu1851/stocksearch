# 🚀 **Stock Search - Complete Setup Guide**

## 📋 **Overview**

Stock Search is a comprehensive full-stack stock market platform with:
- ✅ **User Authentication** (Login/Signup)
- ✅ **Real-time Stock Data** from Polygon API
- ✅ **Interactive Charts** and detailed views
- ✅ **Watchlist Management** for personalized tracking
- ✅ **User Settings** and preferences
- ✅ **Professional UI** with responsive design
- ✅ **PostgreSQL Database** for data persistence

## 🛠️ **Prerequisites**

- Node.js (v14 or higher)
- PostgreSQL database
- Polygon API key (already configured)

## 📦 **Installation Steps**

### 1. **Database Setup**

First, create the PostgreSQL database and run the schema:

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE stocksearch;

-- Connect to the database and run the schema
\c stocksearch

-- Run the schema file
\i server/config/database.sql
```

### 2. **Backend Setup**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp ../.env .

# Start the server
npm run dev
```

### 3. **Frontend Setup**

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Start the frontend
npm start
```

## 🔧 **Configuration**

### Environment Variables

The `.env` file should contain:

```env
# Polygon API Key (REAL-TIME DATA)
POLYGON_API_KEY=zwsfacLmokDCeahJw5Y1uZaU88FTZZNO

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=stocksearch
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### Database Connection

Update `server/config/db.js` with your PostgreSQL credentials:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'your_db_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stocksearch',
    password: process.env.DB_PASSWORD || 'your_db_password',
    port: process.env.DB_PORT || 5432,
});
```

## 🎯 **Features**

### ✅ **Authentication System**
- User registration and login
- Session-based authentication
- Password hashing (SHA-256)
- Profile management

### ✅ **Real-time Stock Data**
- Live prices from Polygon API
- Interactive charts with multiple timeframes
- Detailed stock information
- Auto-refresh functionality

### ✅ **Watchlist Management**
- Create and manage watchlists
- Add/remove stocks from watchlists
- Default watchlist for new users
- Personalized stock tracking

### ✅ **User Settings**
- Theme preferences (light/dark)
- Auto-refresh settings
- Refresh interval customization
- Default watchlist selection

### ✅ **Professional UI**
- Responsive design for all devices
- Modern, clean interface
- Color-coded stock changes
- Loading states and error handling

## 🚀 **Usage**

### **Demo Account**
- **Username:** demo
- **Password:** demo123

### **Access Points**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** PostgreSQL on localhost:5432

### **API Endpoints**

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

#### Stock Data
- `GET /api/stocks/live?symbol=AAPL` - Single stock data
- `GET /api/stocks/batch?symbols=AAPL,GOOGL` - Multiple stocks
- `GET /api/stocks/chart?symbol=AAPL&timeframe=1M` - Chart data
- `GET /api/stocks/details?symbol=AAPL` - Stock details

#### Watchlists
- `GET /api/watchlists` - Get user watchlists
- `POST /api/watchlists` - Create watchlist
- `GET /api/watchlists/:id` - Get specific watchlist
- `PUT /api/watchlists/:id` - Update watchlist
- `DELETE /api/watchlists/:id` - Delete watchlist
- `POST /api/watchlists/:id/stocks` - Add stock to watchlist
- `DELETE /api/watchlists/:id/stocks/:symbol` - Remove stock

#### User Settings
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update settings
- `GET /api/user/dashboard` - Get dashboard data
- `GET /api/user/stats` - Get user statistics

## 🎨 **UI Features**

### **Dashboard**
- Real-time stock grid with live prices
- Interactive charts with multiple timeframes
- Search functionality
- Pagination for large stock lists
- Auto-refresh every 30 seconds

### **Navigation**
- Responsive header with user menu
- Mobile-friendly navigation
- Tab-based interface
- User profile and settings access

### **Authentication**
- Professional login/register forms
- Form validation and error handling
- Demo account for testing
- Session management

## 🔒 **Security Features**

- **Password Hashing:** SHA-256 for password storage
- **Session Management:** Secure session tokens
- **Input Validation:** Server-side validation
- **CORS Configuration:** Proper cross-origin setup
- **Error Handling:** Comprehensive error management

## 📊 **Database Schema**

### **Tables**
- `users` - User accounts and profiles
- `watchlists` - User watchlists
- `watchlist_items` - Stocks in watchlists
- `user_settings` - User preferences
- `stock_prices` - Cached stock data
- `user_sessions` - Authentication sessions

### **Relationships**
- Users have many watchlists
- Watchlists have many stocks
- Users have one settings record
- Sessions belong to users

## 🚀 **Deployment**

### **Development**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm start
```

### **Production**
```bash
# Build frontend
npm run build

# Start backend
cd server && npm start
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **API Key Issues**
   - Verify Polygon API key in `.env`
   - Check API key permissions
   - Monitor rate limits

3. **Port Conflicts**
   - Ensure ports 3000 and 3001 are available
   - Kill existing processes if needed

4. **Authentication Issues**
   - Clear browser localStorage
   - Check session token validity
   - Verify CORS configuration

## 📈 **Performance**

- **Caching:** 2-minute cache for stock data
- **Rate Limiting:** Respects Polygon API limits
- **Optimization:** Efficient database queries
- **Responsive:** Works on all device sizes

## 🎯 **Next Steps**

1. **Complete Watchlist Features**
   - Full CRUD operations
   - Stock search and filtering
   - Watchlist sharing

2. **Enhanced Settings**
   - Theme customization
   - Notification preferences
   - Data export options

3. **Advanced Features**
   - Portfolio tracking
   - Price alerts
   - News integration
   - Social features

---

**🎉 Your Stock Search platform is now ready!**

**Access the application at: http://localhost:3000** 