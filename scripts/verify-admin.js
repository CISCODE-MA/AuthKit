/**
 * Quick script to verify admin user email
 */
const { MongoClient } = require('mongodb');

async function verifyAdmin() {
  console.log('🔓 Verifying admin user email...\n');
  
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_kit_test';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    const result = await db.collection('users').updateOne(
      { email: 'admin@example.com' },
      { $set: { isVerified: true } }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Admin user email verified successfully!');
      console.log('\n🔐 You can now login with:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('\n📱 Test at: http://localhost:5173');
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verifyAdmin();
