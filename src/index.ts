import 'reflect-metadata';

// Module
export { AuthKitModule } from './auth-kit.module';

// Guards (for protecting routes in apps)
export { AuthenticateGuard } from './api/guards/authenticate.guard';
export { AdminGuard } from './api/guards/admin.guard';
export { hasRole } from './api/guards/role.guard';

// Decorators (for extracting data in apps)
export { Admin } from './api/decorators/admin.decorator';

// DTOs (public contracts - what apps consume)
export { LoginDto } from './api/dto/auth/login.dto';
export { RegisterDto } from './api/dto/auth/register.dto';
export { RefreshTokenDto } from './api/dto/auth/refresh-token.dto';
export { VerifyEmailDto } from './api/dto/auth/verify-email.dto';
export { ResendVerificationDto } from './api/dto/auth/resend-verification.dto';
export { ForgotPasswordDto } from './api/dto/auth/forgot-password.dto';
export { ResetPasswordDto } from './api/dto/auth/reset-password.dto';
export { UpdateUserRolesDto } from './api/dto/auth/update-user-role.dto';
export { CreateRoleDto } from './api/dto/role/create-role.dto';
export { UpdateRoleDto, UpdateRolePermissionsDto } from './api/dto/role/update-role.dto';
export { CreatePermissionDto } from './api/dto/permission/create-permission.dto';
export { UpdatePermissionDto } from './api/dto/permission/update-permission.dto';

// Services (if apps need direct access)
export { AuthService } from './infrastructure/auth.service';
export { UsersService } from './infrastructure/users.service';
export { RolesService } from './infrastructure/roles.service';
export { PermissionsService } from './infrastructure/permissions.service';
export { SeedService } from './infrastructure/seed.service';
export { AdminRoleService } from './infrastructure/admin-role.service';
export { MailService } from './infrastructure/mail.service';

// Types (TypeScript interfaces for configuration)
export type { AuthModuleOptions } from './types';
