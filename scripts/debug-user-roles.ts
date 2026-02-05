/**
 * Debug script to check user roles in database
 */

import { connect, connection, Schema, model } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth-kit';

const PermissionSchema = new Schema({
  name: String,
});

const RoleSchema = new Schema({
  name: String,
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
});

const UserSchema = new Schema({
  email: String,
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
});

const Permission = model('Permission', PermissionSchema);
const Role = model('Role', RoleSchema);
const User = model('User', UserSchema);

async function debugUserRoles() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await connect(MONGO_URI);

    // 1. Raw user document (no populate)
    console.log('=== STEP 1: Raw User Document (no populate) ===');
    const rawUser = await User.findOne({ email: 'admin@example.com' });
    console.log('User ID:', rawUser?._id);
    console.log('User Email:', rawUser?.email);
    console.log('User roles field (raw ObjectIds):', rawUser?.roles);
    console.log('Roles count:', rawUser?.roles.length);
    console.log('');

    // 2. User with roles populated (1 level)
    console.log('=== STEP 2: User with Roles Populated (1 level) ===');
    const userWithRoles = await User.findOne({ email: 'admin@example.com' }).populate('roles');
    console.log('User ID:', userWithRoles?._id);
    console.log('User roles (populated):');
    (userWithRoles?.roles as any[])?.forEach((role: any) => {
      console.log(`  - Role name: ${role.name}`);
      console.log(`    Role ID: ${role._id}`);
      console.log(`    Permissions (raw ObjectIds): ${role.permissions}`);
    });
    console.log('');

    // 3. User with roles AND permissions populated (2 levels)
    console.log('=== STEP 3: User with Roles + Permissions Populated (2 levels) ===');
    const userFull = await User.findOne({ email: 'admin@example.com' }).populate({
      path: 'roles',
      populate: { path: 'permissions' },
    });
    console.log('User ID:', userFull?._id);
    console.log('User roles (fully populated):');
    (userFull?.roles as any[])?.forEach((role: any) => {
      console.log(`  - Role name: ${role.name}`);
      console.log(`    Role ID: ${role._id}`);
      console.log(`    Permissions: ${role.permissions.map((p: any) => p.name).join(', ')}`);
    });
    console.log('');

    console.log('✅ Debug complete');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.close();
  }
}

debugUserRoles();
