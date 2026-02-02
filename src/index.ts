import 'reflect-metadata';

// Module
export { AuthKitModule } from './auth-kit.module';

// Services
export { AuthService } from './services/auth.service';
export { SeedService } from './services/seed.service';
export { AdminRoleService } from './services/admin-role.service';

// Guards
export { AuthenticateGuard } from './guards/authenticate.guard';
export { AdminGuard } from './guards/admin.guard';
export { hasRole } from './guards/role.guard';

// Decorators
export { Admin } from './decorators/admin.decorator';

// DTOs - Auth
export { LoginDto } from './dto/auth/login.dto';
export { RegisterDto } from './dto/auth/register.dto';
export { RefreshTokenDto } from './dto/auth/refresh-token.dto';
export { ForgotPasswordDto } from './dto/auth/forgot-password.dto';
export { ResetPasswordDto } from './dto/auth/reset-password.dto';
export { VerifyEmailDto } from './dto/auth/verify-email.dto';
export { ResendVerificationDto } from './dto/auth/resend-verification.dto';
export { UpdateUserRolesDto } from './dto/auth/update-user-role.dto';

// DTOs - Role
export { CreateRoleDto } from './dto/role/create-role.dto';
export { UpdateRoleDto } from './dto/role/update-role.dto';

// DTOs - Permission
export { CreatePermissionDto } from './dto/permission/create-permission.dto';
export { UpdatePermissionDto } from './dto/permission/update-permission.dto';

// Types & Interfaces (for TypeScript typing)
export type {
  AuthTokens,
  RegisterResult,
  OperationResult,
  UserProfile,
  IAuthService,
} from './services/interfaces/auth-service.interface';

export type {
  ILoggerService,
  LogLevel,
} from './services/interfaces/logger-service.interface';

export type {
  IMailService,
} from './services/interfaces/mail-service.interface';
