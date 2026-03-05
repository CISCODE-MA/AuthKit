/**
 * Seed script to create admin user for testing via API
 * Usage: node scripts/seed-admin.ts
 *
 * Note: Backend must be running on http://localhost:3000
 */

async function seedAdmin() {
  console.log('🌱 Starting admin user seed via API...\n');

  const baseURL = 'http://localhost:3000/api/auth';

  try {
    // 1. Try to register admin user
    console.log('👤 Registering admin user...');
    const registerResponse = await fetch(`${baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        username: 'admin',
        fullname: {
          fname: 'Admin',
          lname: 'User',
        },
      }),
    });

    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log('  ✅ Admin user registered successfully');
      console.log('  📧 Email: admin@example.com');
      console.log('  🔑 Password: admin123');
      console.log('  🆔 User ID:', data.user?.id || data.id);

      // Try to login to verify
      console.log('\n🔓 Testing login...');
      const loginResponse = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123',
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('  ✅ Login successful!');
        console.log('  🎫 Access token received');
        console.log('  🔄 Refresh token received');
      } else {
        const error = await loginResponse.json();
        console.log('  ⚠️  Login failed:', error.message);
      }
    } else if (registerResponse.status === 409) {
      console.log('  ⏭️  Admin user already exists');

      // Try to login anyway
      console.log('\n🔓 Testing login with existing user...');
      const loginResponse = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123',
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('  ✅ Login successful!');
        console.log('  🎫 Access token received');
      } else {
        const error = await loginResponse.json();
        console.log('  ❌ Login failed:', error.message);
        console.log('  💡 The existing user might have a different password');
      }
    } else {
      const error = await registerResponse.json();
      console.error('  ❌ Registration failed:', error.message || error);
      process.exit(1);
    }

    console.log('\n✅ Seed completed!');
    console.log('\n🔐 Test credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n📱 Test at: http://localhost:5173');
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(
      '💡 Make sure the backend is running on http://localhost:3000',
    );
    process.exit(1);
  }
}

seedAdmin();
