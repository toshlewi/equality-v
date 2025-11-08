// Verification script to check env vars, DB, API routes, and credentials
// Run: npm run verify:integrations or tsx src/scripts/verify-integrations.ts

require('dotenv').config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';
import { mpesaClient } from '../lib/mpesa';
import Stripe from 'stripe';

interface VerificationResult {
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: VerificationResult[] = [];

function addResult(category: string, name: string, status: 'pass' | 'fail' | 'warning', message: string) {
  results.push({ category, name, status, message });
}

async function verifyEnvironmentVariables() {
  console.log('🔍 Verifying Environment Variables...\n');

  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'ADMIN_NAME',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_ACCOUNT_ID',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
    'NEXT_PUBLIC_URL',
    'NEXT_PUBLIC_API_URL',
    'NODE_ENV'
  ];

  const optionalVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_SHORTCODE',
    'MPESA_PASSKEY',
    'MPESA_ENVIRONMENT',
    'MAILGUN_API_KEY',
    'MAILGUN_DOMAIN',
    'MAILGUN_FROM_EMAIL',
    'MAILGUN_FROM_NAME',
    'MAILCHIMP_API_KEY',
    'MAILCHIMP_LIST_ID',
    'MAILCHIMP_SERVER_PREFIX',
    'RECAPTCHA_SITE_KEY',
    'RECAPTCHA_SECRET_KEY'
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      addResult('Environment', varName, 'pass', 'Set');
    } else {
      addResult('Environment', varName, 'fail', 'Missing (required)');
    }
  }

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      addResult('Environment', varName, 'pass', 'Set');
    } else {
      addResult('Environment', varName, 'warning', 'Not set (optional)');
    }
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying Database Connection...\n');

  try {
    await connectDB();
    addResult('Database', 'Connection', 'pass', 'Connected successfully');
    
    // Test a simple query
    const { default: Member } = await import('../models/Member');
    const count = await Member.countDocuments();
    addResult('Database', 'Query Test', 'pass', `Member collection accessible (${count} documents)`);
  } catch (error) {
    addResult('Database', 'Connection', 'fail', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyStripe() {
  console.log('🔍 Verifying Stripe Configuration...\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    addResult('Stripe', 'Configuration', 'warning', 'Stripe not configured (optional)');
    return;
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover'
    });

    // Test API call
    const account = await stripe.accounts.retrieve();
    addResult('Stripe', 'API Connection', 'pass', `Connected (Account: ${account.id})`);

    if (process.env.STRIPE_PUBLISHABLE_KEY) {
      addResult('Stripe', 'Publishable Key', 'pass', 'Set');
    } else {
      addResult('Stripe', 'Publishable Key', 'warning', 'Not set');
    }

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      addResult('Stripe', 'Webhook Secret', 'pass', 'Set');
    } else {
      addResult('Stripe', 'Webhook Secret', 'warning', 'Not set (required for webhooks)');
    }
  } catch (error) {
    addResult('Stripe', 'API Connection', 'fail', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyMpesa() {
  console.log('🔍 Verifying M-Pesa Configuration...\n');

  if (!process.env.MPESA_CONSUMER_KEY) {
    addResult('M-Pesa', 'Configuration', 'warning', 'M-Pesa not configured (optional)');
    return;
  }

  try {
    const isConfigured = mpesaClient.isConfigured();
    if (isConfigured) {
      addResult('M-Pesa', 'Configuration', 'pass', 'All credentials set');
      
      // Test access token generation
      try {
        await mpesaClient.generateAccessToken();
        addResult('M-Pesa', 'API Connection', 'pass', 'Access token generated successfully');
      } catch (error) {
        addResult('M-Pesa', 'API Connection', 'fail', `Failed to generate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      addResult('M-Pesa', 'Configuration', 'fail', 'Missing required credentials');
    }
  } catch (error) {
    addResult('M-Pesa', 'Configuration', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyMailgun() {
  console.log('🔍 Verifying Mailgun Configuration...\n');

  if (!process.env.MAILGUN_API_KEY) {
    addResult('Mailgun', 'Configuration', 'warning', 'Mailgun not configured (optional)');
    return;
  }

  try {
    const { default: formData } = await import('form-data');
    const Mailgun = (await import('mailgun.js')).default;
    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY!
    });

    // Test API call
    const domain = process.env.MAILGUN_DOMAIN!;
    const response = await mg.domains.get(domain);
    
    if (response) {
      addResult('Mailgun', 'API Connection', 'pass', `Domain verified: ${domain}`);
    } else {
      addResult('Mailgun', 'API Connection', 'fail', 'Domain verification failed');
    }

    if (process.env.MAILGUN_FROM_EMAIL) {
      addResult('Mailgun', 'From Email', 'pass', process.env.MAILGUN_FROM_EMAIL);
    } else {
      addResult('Mailgun', 'From Email', 'warning', 'Not set');
    }
  } catch (error) {
    addResult('Mailgun', 'API Connection', 'fail', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyMailchimp() {
  console.log('🔍 Verifying Mailchimp Configuration...\n');

  if (!process.env.MAILCHIMP_API_KEY) {
    addResult('Mailchimp', 'Configuration', 'warning', 'Mailchimp not configured (optional)');
    return;
  }

  try {
    const mailchimp = (await import('@mailchimp/mailchimp_marketing')).default;
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX || 'us1'
    });

    // Test API call
    const response = await mailchimp.ping.get();
    
    if (response) {
      addResult('Mailchimp', 'API Connection', 'pass', 'Connected successfully');
    } else {
      addResult('Mailchimp', 'API Connection', 'fail', 'Connection failed');
    }

    if (process.env.MAILCHIMP_LIST_ID) {
      addResult('Mailchimp', 'List ID', 'pass', 'Set');
    } else {
      addResult('Mailchimp', 'List ID', 'warning', 'Not set');
    }
  } catch (error) {
    addResult('Mailchimp', 'API Connection', 'fail', `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyApiRoutes() {
  console.log('🔍 Verifying API Routes...\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const routes = [
    { path: '/api/membership', method: 'GET', name: 'Membership API' },
    { path: '/api/donations', method: 'GET', name: 'Donations API' },
    { path: '/api/newsletter/subscribe', method: 'POST', name: 'Newsletter Subscribe' },
    { path: '/api/newsletter/unsubscribe', method: 'GET', name: 'Newsletter Unsubscribe' }
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' }
      });

      // Any response (even 400/500) means the route exists
      if (response.status < 500) {
        addResult('API Routes', route.name, 'pass', `Route accessible (${response.status})`);
      } else {
        addResult('API Routes', route.name, 'fail', `Route error (${response.status})`);
      }
    } catch {
      // If server is not running, this will fail
      addResult('API Routes', route.name, 'warning', `Cannot verify (server may not be running)`);
    }
  }
}

async function printResults() {
  console.log('\n=============================================================================');
  console.log('📊 Verification Results Summary');
  console.log('=============================================================================\n');

  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    console.log(`📂 ${category}:`);
    const categoryResults = results.filter(r => r.category === category);
    
    for (const result of categoryResults) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`  ${icon} ${result.name}: ${result.message}`);
    }
    console.log('');
  }

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  console.log('=============================================================================');
  console.log('Summary:');
  console.log(`  ✅ Passed: ${passCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  ⚠️  Warnings: ${warningCount}`);
  console.log(`  📊 Total: ${results.length}`);
  console.log('=============================================================================\n');

  if (failCount > 0) {
    console.log('⚠️  Some verifications failed. Please review the errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All critical verifications passed!\n');
    process.exit(0);
  }
}

async function main() {
  console.log('=============================================================================');
  console.log('Integration Verification Script');
  console.log('=============================================================================\n');

  await verifyEnvironmentVariables();
  await verifyDatabase();
  await verifyStripe();
  await verifyMpesa();
  await verifyMailgun();
  await verifyMailchimp();
  await verifyApiRoutes();
  await printResults();
}

main().catch(console.error);




