// Debug environment variables
console.log('🔍 Debugging environment variables...');

// Check if dotenv is loaded
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI value:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Try to load dotenv manually
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ dotenv loaded .env.local');
  console.log('MONGODB_URI after dotenv:', process.env.MONGODB_URI ? 'Set' : 'Not set');
} catch (error) {
  console.log('❌ Error loading dotenv:', error);
}

// Check all environment variables
console.log('\n📋 All environment variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('MONGO') || key.startsWith('NEXT'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key] ? 'Set' : 'Not set'}`);
  });

// Export for use in other modules
export default function debugEnv() {
  console.log('🔍 Debugging environment variables...');
  // ... rest of the debug logic
}

// Run the debug
debugEnv();
