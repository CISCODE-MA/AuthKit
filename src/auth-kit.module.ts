import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AuthController } from '@controllers/auth.controller';
import { UsersController } from '@controllers/users.controller';
import { RolesController } from '@controllers/roles.controller';
import { PermissionsController } from '@controllers/permissions.controller';
import { HealthController } from '@controllers/health.controller';

import { User, UserSchema } from '@models/user.model';
import { Role, RoleSchema } from '@models/role.model';
import { Permission, PermissionSchema } from '@models/permission.model';

import { AuthService } from '@services/auth.service';
import { UsersService } from '@services/users.service';
import { RolesService } from '@services/roles.service';
import { PermissionsService } from '@services/permissions.service';
import { MailService } from '@services/mail.service';
import { SeedService } from '@services/seed.service';
import { LoggerService } from '@services/logger.service';

import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';

import { AuthenticateGuard } from '@middleware/authenticate.guard';
import { AdminGuard } from '@middleware/admin.guard';
import { AdminRoleService } from '@services/admin-role.service';
import { OAuthService } from '@services/oauth.service';
import { GlobalExceptionFilter } from '@filters/http-exception.filter';
import passport from 'passport';
import { registerOAuthStrategies } from '@config/passport.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
    HealthController,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    AuthService,
    UsersService,
    RolesService,
    PermissionsService,
    MailService,
    SeedService,
    LoggerService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AuthenticateGuard,
    AdminGuard,
    AdminRoleService,
    OAuthService,
  ],
  exports: [
    AuthService,
    UsersService,
    RolesService,
    PermissionsService,
    SeedService,
    LoggerService,
    AuthenticateGuard,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AdminGuard,
    AdminRoleService,
  ],
})
export class AuthKitModule implements NestModule, OnModuleInit {
  constructor(private readonly oauth: OAuthService) { }

  onModuleInit() {
    registerOAuthStrategies(this.oauth);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), passport.initialize())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
