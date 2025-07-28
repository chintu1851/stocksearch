const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test single stock
    const singleResponse = await axios.get('http://localhost:3001/api/stocks/live?symbol=AAPL');
    console.log('Single stock response:', singleResponse.data);
    
    // Test batch stocks
    const batchResponse = await axios.get('http://localhost:3001/api/stocks/batch?symbols=AAPL,GOOGL');
    console.log('Batch stocks response:', batchResponse.data);
    
  } catch (error) {
    console.error('API Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI(); 