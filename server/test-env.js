require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLE TEST ===');
console.log('POLYGON_API_KEY exists:', !!process.env.POLYGON_API_KEY);
console.log('POLYGON_API_KEY value:', process.env.POLYGON_API_KEY);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('POLYGON')));
console.log('=== END TEST ==='); 