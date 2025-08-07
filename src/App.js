import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import StockDashboard from './components/StockDashboard';
import StockSearch from './components/StockSearch';
import PortfolioTracker from './components/PortfolioTracker';
import WatchlistManager from './components/WatchlistManager';
import UserProfile from './components/UserProfile';
import UserSettings from './components/UserSettings';
import Login from './components/Login';
import Register from './components/Register';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<StockDashboard />} />
            <Route path="/search" element={<StockSearch />} />
            <Route path="/portfolio" element={<PortfolioTracker />} />
            <Route path="/watchlist" element={<WatchlistManager />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<UserSettings />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
