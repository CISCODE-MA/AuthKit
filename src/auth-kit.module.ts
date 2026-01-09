import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule, OnModuleDestroy, OnModuleInit, RequestMethod } from '@nestjs/common';
import passport from './config/passport.config';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import { connectDB } from './config/db.config';
import { AuthController } from './controllers/auth.controller';
import { PasswordResetController } from './controllers/password-reset.controller';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
  controllers: [
    AuthController,
    PasswordResetController,
    UsersController,
    RolesController,
    PermissionsController,
    AdminController,
  ],
})
export class AuthKitModule implements NestModule, OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await connectDB();
  }

  async onModuleDestroy(): Promise<void> {
    await mongoose.disconnect();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), passport.initialize())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
