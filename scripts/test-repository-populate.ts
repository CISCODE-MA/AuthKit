/**
 * Test repository populate directly in backend context
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module';
import { UserRepository } from '../dist/repositories/user.repository';

async function testRepositoryPopulate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get(UserRepository);

  console.log('\n=== Testing UserRepository.findByIdWithRolesAndPermissions ===\n');

  const user = await userRepo.findByIdWithRolesAndPermissions('6983622688347e9d3b51ca00');
  
  console.log('User ID:', user?._id);
  console.log('User email:', user?.email);
  console.log('\nuser.roles (typeof):', typeof user?.roles);
  console.log('user.roles (array?):', Array.isArray(user?.roles));
  console.log('user.roles (length):', user?.roles?.length);
  console.log('\nuser.roles (raw):', user?.roles);
  console.log('\nuser.roles (JSON.stringify):', JSON.stringify(user?.roles));

  if (user?.roles && user.roles.length > 0) {
    console.log('\nFirst role:');
    const firstRole = (user.roles as any)[0];
    console.log('  Type:', typeof firstRole);
    console.log('  Is ObjectId?:', firstRole?.constructor?.name);
    console.log('  Has .name?:', firstRole?.name);
    console.log('  Has .permissions?:', firstRole?.permissions);
    console.log('  Raw:', firstRole);
  }

  await app.close();
}

testRepositoryPopulate().catch(console.error);
