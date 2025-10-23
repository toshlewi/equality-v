import { S3Client, ListBucketsCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

async function testStorageConnection() {
  try {
    console.log('🔄 Testing Cloudflare R2 connection...');
    
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
    
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      throw new Error('Missing Cloudflare R2 environment variables');
    }
    
    // Create S3 client
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
    
    // Test connection by listing buckets
    console.log('📦 Testing bucket access...');
    const listBucketsCommand = new ListBucketsCommand({});
    const listBucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log('✅ Successfully connected to Cloudflare R2');
    console.log(`📊 Found ${listBucketsResponse.Buckets?.length || 0} buckets`);
    
    // Test specific bucket access
    console.log(`🔍 Testing access to bucket: ${R2_BUCKET_NAME}`);
    const headBucketCommand = new HeadBucketCommand({ Bucket: R2_BUCKET_NAME });
    await s3Client.send(headBucketCommand);
    
    console.log('✅ Bucket access confirmed');
    console.log('🎉 Cloudflare R2 connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Cloudflare R2 connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testStorageConnection();
