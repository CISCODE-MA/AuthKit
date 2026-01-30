import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AuthController } from '@api/auth.controller';
import { UsersController } from '@api/users.controller';
import { RolesController } from '@api/roles.controller';
import { PermissionsController } from '@api/permissions.controller';
import { HealthController } from '@api/health.controller';

import { User, UserSchema } from '@domain/user.model';
import { Role, RoleSchema } from '@domain/role.model';
import { Permission, PermissionSchema } from '@domain/permission.model';

import { AuthService } from '@infrastructure/auth.service';
import { UsersService } from '@infrastructure/users.service';
import { RolesService } from '@infrastructure/roles.service';
import { PermissionsService } from '@infrastructure/permissions.service';
import { MailService } from '@infrastructure/mail.service';
import { SeedService } from '@infrastructure/seed.service';
import { LoggerService } from '@infrastructure/logger.service';

import { UserRepository } from '@infrastructure/user.repository';
import { RoleRepository } from '@infrastructure/role.repository';
import { PermissionRepository } from '@infrastructure/permission.repository';

import { AuthenticateGuard } from '@api/guards/authenticate.guard';
import { AdminGuard } from '@api/guards/admin.guard';
import { AdminRoleService } from '@infrastructure/admin-role.service';
import { OAuthService } from '@infrastructure/oauth.service';
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
