import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import cookieParser from 'cookie-parser';

import { AuthController } from '@controllers/auth.controller';
import { UsersController } from '@controllers/users.controller';
import { RolesController } from '@controllers/roles.controller';
import { PermissionsController } from '@controllers/permissions.controller';

import { User, UserSchema } from '@models/user.model';
import { Role, RoleSchema } from '@models/role.model';
import { Permission, PermissionSchema } from '@models/permission.model';

import { AuthService } from '@services/auth.service';
import { UsersService } from '@services/users.service';
import { RolesService } from '@services/roles.service';
import { PermissionsService } from '@services/permissions.service';
import { MailService } from '@services/mail.service';
import { SeedService } from '@services/seed.service';

import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { PermissionRepository } from '@repos/permission.repository';

import { AuthenticateGuard } from '@middleware/authenticate.guard';

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
  ],
  providers: [
    AuthService,
    UsersService,
    RolesService,
    PermissionsService,
    MailService,
    SeedService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AuthenticateGuard,
  ],
  exports: [
    AuthService,
    UsersService,
    RolesService,
    PermissionsService,
    SeedService,
    AuthenticateGuard,
    UserRepository,
    RoleRepository,
    PermissionRepository,
  ],
})
export class AuthKitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
