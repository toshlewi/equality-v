// Environment validation script
require('dotenv').config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';

interface EnvVar {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
  category: string;
}

const envVars: EnvVar[] = [
  // Database
  { name: 'MONGODB_URI', value: process.env.MONGODB_URI, required: true, description: 'MongoDB connection string', category: 'Database' },
  
  // Authentication
  { name: 'NEXTAUTH_URL', value: process.env.NEXTAUTH_URL, required: true, description: 'NextAuth base URL', category: 'Authentication' },
  { name: 'NEXTAUTH_SECRET', value: process.env.NEXTAUTH_SECRET, required: true, description: 'NextAuth secret key', category: 'Authentication' },
  { name: 'GOOGLE_CLIENT_ID', value: process.env.GOOGLE_CLIENT_ID, required: false, description: 'Google OAuth client ID', category: 'Authentication' },
  { name: 'GOOGLE_CLIENT_SECRET', value: process.env.GOOGLE_CLIENT_SECRET, required: false, description: 'Google OAuth client secret', category: 'Authentication' },
  
  // Admin User
  { name: 'ADMIN_EMAIL', value: process.env.ADMIN_EMAIL, required: true, description: 'Admin user email', category: 'Admin' },
  { name: 'ADMIN_PASSWORD', value: process.env.ADMIN_PASSWORD, required: true, description: 'Admin user password', category: 'Admin' },
  { name: 'ADMIN_NAME', value: process.env.ADMIN_NAME, required: true, description: 'Admin user name', category: 'Admin' },
  
  // Stripe
  { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY, required: false, description: 'Stripe secret key', category: 'Payments' },
  { name: 'STRIPE_PUBLISHABLE_KEY', value: process.env.STRIPE_PUBLISHABLE_KEY, required: false, description: 'Stripe publishable key', category: 'Payments' },
  { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET, required: false, description: 'Stripe webhook secret', category: 'Payments' },
  
  // M-Pesa
  { name: 'MPESA_CONSUMER_KEY', value: process.env.MPESA_CONSUMER_KEY, required: false, description: 'M-Pesa consumer key', category: 'Payments' },
  { name: 'MPESA_CONSUMER_SECRET', value: process.env.MPESA_CONSUMER_SECRET, required: false, description: 'M-Pesa consumer secret', category: 'Payments' },
  { name: 'MPESA_SHORTCODE', value: process.env.MPESA_SHORTCODE, required: false, description: 'M-Pesa shortcode', category: 'Payments' },
  { name: 'MPESA_PASSKEY', value: process.env.MPESA_PASSKEY, required: false, description: 'M-Pesa passkey', category: 'Payments' },
  { name: 'MPESA_ENVIRONMENT', value: process.env.MPESA_ENVIRONMENT, required: false, description: 'M-Pesa environment', category: 'Payments' },
  
  // Email - Resend
  { name: 'RESEND_API_KEY', value: process.env.RESEND_API_KEY, required: false, description: 'Resend API key', category: 'Email' },
  { name: 'EMAIL_FROM', value: process.env.EMAIL_FROM, required: false, description: 'Email from address', category: 'Email' },
  
  // Mailchimp
  { name: 'MAILCHIMP_API_KEY', value: process.env.MAILCHIMP_API_KEY, required: false, description: 'Mailchimp API key', category: 'Email' },
  { name: 'MAILCHIMP_LIST_ID', value: process.env.MAILCHIMP_LIST_ID, required: false, description: 'Mailchimp list ID', category: 'Email' },
  { name: 'MAILCHIMP_SERVER_PREFIX', value: process.env.MAILCHIMP_SERVER_PREFIX, required: false, description: 'Mailchimp server prefix', category: 'Email' },
  
  // File Storage
  { name: 'R2_ACCESS_KEY_ID', value: process.env.R2_ACCESS_KEY_ID, required: true, description: 'Cloudflare R2 access key', category: 'Storage' },
  { name: 'R2_SECRET_ACCESS_KEY', value: process.env.R2_SECRET_ACCESS_KEY, required: true, description: 'Cloudflare R2 secret key', category: 'Storage' },
  { name: 'R2_ACCOUNT_ID', value: process.env.R2_ACCOUNT_ID, required: true, description: 'Cloudflare R2 account ID', category: 'Storage' },
  { name: 'R2_BUCKET_NAME', value: process.env.R2_BUCKET_NAME, required: true, description: 'Cloudflare R2 bucket name', category: 'Storage' },
  { name: 'R2_PUBLIC_URL', value: process.env.R2_PUBLIC_URL, required: true, description: 'Cloudflare R2 public URL', category: 'Storage' },
  
  // Security
  { name: 'RECAPTCHA_SITE_KEY', value: process.env.RECAPTCHA_SITE_KEY, required: false, description: 'reCAPTCHA site key', category: 'Security' },
  { name: 'RECAPTCHA_SECRET_KEY', value: process.env.RECAPTCHA_SECRET_KEY, required: false, description: 'reCAPTCHA secret key', category: 'Security' },
  
  // Analytics
  { name: 'GOOGLE_ANALYTICS_ID', value: process.env.GOOGLE_ANALYTICS_ID, required: false, description: 'Google Analytics ID', category: 'Analytics' },
  { name: 'SENTRY_DSN', value: process.env.SENTRY_DSN, required: false, description: 'Sentry DSN', category: 'Analytics' },
  { name: 'SENTRY_AUTH_TOKEN', value: process.env.SENTRY_AUTH_TOKEN, required: false, description: 'Sentry auth token', category: 'Analytics' },
  
  // Redis
  { name: 'REDIS_URL', value: process.env.REDIS_URL, required: false, description: 'Redis connection URL', category: 'Cache' },
  
  // Application
  { name: 'NEXT_PUBLIC_URL', value: process.env.NEXT_PUBLIC_URL, required: true, description: 'Public application URL', category: 'Application' },
  { name: 'NEXT_PUBLIC_API_URL', value: process.env.NEXT_PUBLIC_API_URL, required: true, description: 'Public API URL', category: 'Application' },
  { name: 'NODE_ENV', value: process.env.NODE_ENV, required: true, description: 'Node environment', category: 'Application' },
];

async function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const categories = [...new Set(envVars.map(v => v.category))];
  let hasErrors = false;
  
  for (const category of categories) {
    console.log(`📂 ${category}:`);
    const categoryVars = envVars.filter(v => v.category === category);
    
    for (const envVar of categoryVars) {
      const isSet = !!envVar.value;
      const status = isSet ? '✅' : (envVar.required ? '❌' : '⚠️');
      const required = envVar.required ? '(Required)' : '(Optional)';
      
      console.log(`  ${status} ${envVar.name} ${required}`);
      console.log(`     ${envVar.description}`);
      
      if (envVar.required && !isSet) {
        hasErrors = true;
      }
    }
    console.log('');
  }
  
  // Summary
  const requiredVars = envVars.filter(v => v.required);
  const setRequiredVars = requiredVars.filter(v => !!v.value);
  const optionalVars = envVars.filter(v => !v.required);
  const setOptionalVars = optionalVars.filter(v => !!v.value);
  
  console.log('📊 Summary:');
  console.log(`  Required variables: ${setRequiredVars.length}/${requiredVars.length} set`);
  console.log(`  Optional variables: ${setOptionalVars.length}/${optionalVars.length} set`);
  console.log(`  Total variables: ${envVars.length}`);
  
  if (hasErrors) {
    console.log('\n❌ Some required environment variables are missing!');
    console.log('Please check your .env.local file and add the missing variables.');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are set!');
    console.log('🎉 Environment validation completed successfully!');
  }
  
  // Close connection
  await connectDB();
  console.log('🔌 Database connection closed');
}

// Run validation
validateEnvironment().catch(console.error);

// Export for use in other modules
export default validateEnvironment;
