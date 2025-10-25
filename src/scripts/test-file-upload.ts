import { generatePresignedUploadUrl, getPublicFileUrl } from '../lib/storage';
import { connectDB } from '../lib/mongodb';

async function testFileUpload() {
  try {
    console.log('🔄 Testing file upload functionality...');
    
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    // Test generating presigned URL
    console.log('📤 Testing presigned URL generation...');
    const { uploadUrl, fileKey, publicUrl } = await generatePresignedUploadUrl(
      'test-image.jpg',
      'image/jpeg',
      {
        folder: 'test',
        expires: 3600
      }
    );
    
    console.log('✅ Presigned URL generated successfully');
    console.log(`📁 File key: ${fileKey}`);
    console.log(`🔗 Upload URL: ${uploadUrl.substring(0, 100)}...`);
    console.log(`🌐 Public URL: ${publicUrl}`);
    
    // Test public URL generation
    console.log('🔗 Testing public URL generation...');
    const testPublicUrl = getPublicFileUrl(fileKey);
    console.log(`✅ Public URL: ${testPublicUrl}`);
    
    console.log('🎉 File upload functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ File upload test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await connectDB();
    console.log('🔌 Database connection closed');
  }
}


// Run the test
testFileUpload();

// Export for use in other modules
export default testFileUpload;
