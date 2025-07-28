#!/bin/bash

echo "🚀 Stock Market Dashboard Setup"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating one..."
    cat > .env << 'EOF'
# ========================================
# STOCK MARKET DASHBOARD - ENVIRONMENT VARIABLES
# ========================================

# Alpha Vantage API Key (REQUIRED for real-time data)
# Get your free key from: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Optional - for future features)
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server && npm install && cd ..

echo ""
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo "1. Get your free API key from: https://www.alphavantage.co/support/#api-key"
echo "2. Edit .env file and replace 'your_api_key_here' with your actual key"
echo "3. Start the servers:"
echo "   - Terminal 1: cd server && npm run dev"
echo "   - Terminal 2: npm start"
echo "4. Open http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "- README.md - Main documentation"
echo "- REALTIME_SETUP.md - Real-time data setup"
echo "- PROJECT_STRUCTURE.md - File structure guide"
echo "" 