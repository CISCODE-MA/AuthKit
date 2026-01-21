import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import passport from './config/passport.config';
import cookieParser from 'cookie-parser';

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
export class AuthKitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), passport.initialize())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
