#!/bin/bash

# Stock Search Pro - Complete Setup Script
# This script sets up the entire stock market platform

echo "🚀 Stock Search Pro - Complete Setup"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check if PostgreSQL is installed
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. You'll need to install it manually."
        print_warning "For macOS: brew install postgresql"
        print_warning "For Ubuntu: sudo apt-get install postgresql postgresql-contrib"
        print_warning "For Windows: Download from https://www.postgresql.org/download/"
    else
        print_success "PostgreSQL is installed"
    fi
}

# Create .env file if it doesn't exist
create_env_file() {
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stocksearch
DB_USER=patelchintan
DB_PASSWORD=

# Polygon API Key (Get from https://polygon.io/)
POLYGON_API_KEY=your_polygon_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
EOF
        print_success ".env file created"
        print_warning "Please update the .env file with your actual API keys and database credentials"
    else
        print_status ".env file already exists"
    fi
}

# Install client dependencies
install_client_deps() {
    print_status "Installing client dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Client dependencies installed"
    else
        print_error "Failed to install client dependencies"
        exit 1
    fi
}

# Install server dependencies
install_server_deps() {
    print_status "Installing server dependencies..."
    cd server
    npm install
    if [ $? -eq 0 ]; then
        print_success "Server dependencies installed"
    else
        print_error "Failed to install server dependencies"
        exit 1
    fi
    cd ..
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -q; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Please start it manually."
            print_warning "For macOS: brew services start postgresql"
            print_warning "For Ubuntu: sudo systemctl start postgresql"
        fi
    fi
    
    # Create database if it doesn't exist
    if command -v createdb &> /dev/null; then
        if createdb -U patelchintan stocksearch 2>/dev/null; then
            print_success "Database 'stocksearch' created"
        else
            print_status "Database 'stocksearch' already exists or creation failed"
        fi
    else
        print_warning "createdb command not found. Please create the database manually:"
        print_warning "createdb -U patelchintan stocksearch"
    fi
}

# Create logs directory
create_logs_dir() {
    print_status "Creating logs directory..."
    mkdir -p server/logs
    print_success "Logs directory created"
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Failed to build application"
        exit 1
    fi
}

# Start the application
start_app() {
    print_status "Starting the application..."
    print_status "Starting server on port 3001..."
    cd server
    npm run dev &
    SERVER_PID=$!
    cd ..
    
    print_status "Starting client on port 3000..."
    npm start &
    CLIENT_PID=$!
    
    print_success "Application started!"
    print_status "Server PID: $SERVER_PID"
    print_status "Client PID: $CLIENT_PID"
    print_status "Server URL: http://localhost:3001"
    print_status "Client URL: http://localhost:3000"
    
    echo ""
    print_success "🎉 Stock Search Pro is now running!"
    echo ""
    echo "📊 Features available:"
    echo "  • Real-time stock data from Polygon API"
    echo "  • Interactive charts and technical analysis"
    echo "  • Market overview and sector performance"
    echo "  • News center with financial news"
    echo "  • Portfolio tracking and watchlists"
    echo "  • User authentication and profiles"
    echo ""
    echo "🔧 Configuration:"
    echo "  • Update .env file with your Polygon API key"
    echo "  • Configure database credentials if needed"
    echo ""
    echo "📱 Access the application at: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop the application"
    
    # Wait for user to stop
    wait
}

# Main setup function
main() {
    echo ""
    print_status "Starting Stock Search Pro setup..."
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    check_postgres
    
    echo ""
    print_status "Installing dependencies..."
    
    # Install dependencies
    install_client_deps
    install_server_deps
    
    echo ""
    print_status "Setting up environment..."
    
    # Setup environment
    create_env_file
    create_logs_dir
    setup_database
    
    echo ""
    print_status "Building application..."
    
    # Build application
    build_app
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    
    # Ask user if they want to start the application
    read -p "Do you want to start the application now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_app
    else
        print_status "To start the application later, run:"
        echo "  npm run dev"
        echo ""
        print_status "Or start server and client separately:"
        echo "  cd server && npm run dev"
        echo "  npm start"
    fi
}

# Run main function
main "$@" 