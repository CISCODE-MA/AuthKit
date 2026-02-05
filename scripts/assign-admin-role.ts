/**
 * Assign admin role to admin@example.com user
 * Usage: npx ts-node scripts/assign-admin-role.ts
 */

import { connect, connection, Schema, model } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth-kit';

// Minimal schemas
const PermissionSchema = new Schema({
  name: String,
});

const UserSchema = new Schema({
  email: String,
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
});

const RoleSchema = new Schema({
  name: String,
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
});

const Permission = model('Permission', PermissionSchema);
const User = model('User', UserSchema);
const Role = model('Role', RoleSchema);

async function assignAdminRole() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    console.log('👤 Finding admin@example.com...');
    const user = await User.findOne({ email: 'admin@example.com' });
    if (!user) {
      console.error('❌ User admin@example.com not found');
      process.exit(1);
    }
    console.log(`✅ Found user: ${user.email} (ID: ${user._id})\n`);

    // Find admin role
    console.log('🔑 Finding admin role...');
    const adminRole = await Role.findOne({ name: 'admin' }).populate('permissions');
    if (!adminRole) {
      console.error('❌ Admin role not found');
      process.exit(1);
    }
    console.log(`✅ Found admin role (ID: ${adminRole._id})`);
    console.log(`   Permissions: ${(adminRole.permissions as any[]).map((p: any) => p.name).join(', ')}\n`);

    // Check if user already has admin role
    const hasAdminRole = user.roles.some((roleId) => roleId.toString() === adminRole._id.toString());
    if (hasAdminRole) {
      console.log('ℹ️  User already has admin role');
    } else {
      // Assign admin role
      console.log('🔧 Assigning admin role to user...');
      user.roles.push(adminRole._id);
      await user.save();
      console.log('✅ Admin role assigned successfully!\n');
    }

    // Verify
    const updatedUser = await User.findById(user._id).populate({
      path: 'roles',
      populate: { path: 'permissions' },
    });
    
    console.log('📋 User roles and permissions:');
    const roles = updatedUser?.roles as any[] || [];
    roles.forEach((role: any) => {
      console.log(`   - ${role.name}: ${role.permissions.map((p: any) => p.name).join(', ')}`);
    });

    console.log('\n✅ Done! Now try logging in again and check the JWT token.');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

assignAdminRole();
