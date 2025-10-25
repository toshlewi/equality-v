import { S3Client, ListBucketsCommand, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { connectDB } from '../lib/mongodb';

async function debugR2Connection() {
  try {
    console.log('🔍 Debugging Cloudflare R2 connection...');
    
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
    
    console.log('📋 Environment variables:');
    console.log('R2_ACCESS_KEY_ID:', R2_ACCESS_KEY_ID ? 'Set' : 'Not set');
    console.log('R2_SECRET_ACCESS_KEY:', R2_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
    console.log('R2_ACCOUNT_ID:', R2_ACCOUNT_ID);
    console.log('R2_BUCKET_NAME:', R2_BUCKET_NAME);
    console.log('R2_PUBLIC_URL:', R2_PUBLIC_URL);
    
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
    
    console.log('🔗 Endpoint:', `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    
    // Test 1: List buckets
    console.log('\n📦 Test 1: Listing buckets...');
    try {
      const listBucketsCommand = new ListBucketsCommand({});
      const listBucketsResponse = await s3Client.send(listBucketsCommand);
      console.log('✅ Successfully listed buckets');
      console.log(`📊 Found ${listBucketsResponse.Buckets?.length || 0} buckets:`);
      listBucketsResponse.Buckets?.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.Name} (created: ${bucket.CreationDate})`);
      });
    } catch (error: any) {
      console.error('❌ Failed to list buckets:', error.message);
      console.error('Error code:', error.Code);
      console.error('Status code:', error.$metadata?.httpStatusCode);
    }
    
    // Test 2: Check specific bucket
    console.log(`\n🔍 Test 2: Checking bucket "${R2_BUCKET_NAME}"...`);
    try {
      const headBucketCommand = new HeadBucketCommand({ Bucket: R2_BUCKET_NAME });
      await s3Client.send(headBucketCommand);
      console.log('✅ Bucket access confirmed');
    } catch (error: any) {
      console.error('❌ Failed to access bucket:', error.message);
      console.error('Error code:', error.Code);
      console.error('Status code:', error.$metadata?.httpStatusCode);
    }
    
    // Test 3: List objects in bucket
    console.log(`\n📁 Test 3: Listing objects in bucket "${R2_BUCKET_NAME}"...`);
    try {
      const listObjectsCommand = new ListObjectsV2Command({ 
        Bucket: R2_BUCKET_NAME,
        MaxKeys: 5
      });
      const listObjectsResponse = await s3Client.send(listObjectsCommand);
      console.log('✅ Successfully listed objects');
      console.log(`📊 Found ${listObjectsResponse.Contents?.length || 0} objects`);
      listObjectsResponse.Contents?.forEach((object, index) => {
        console.log(`  ${index + 1}. ${object.Key} (size: ${object.Size} bytes)`);
      });
    } catch (error: any) {
      console.error('❌ Failed to list objects:', error.message);
      console.error('Error code:', error.Code);
      console.error('Status code:', error.$metadata?.httpStatusCode);
    }
    
    console.log('\n🎉 R2 debugging completed!');
    
  } catch (error) {
    console.error('❌ R2 debugging failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await connectDB();
    console.log('🔌 Database connection closed');
  }
}

// Run the debug
debugR2Connection();

// Export for use in other modules
export default debugR2Connection;
