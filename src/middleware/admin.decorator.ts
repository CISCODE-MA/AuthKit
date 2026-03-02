import { AdminGuard } from "@middleware/admin.guard";
import { AuthenticateGuard } from "@middleware/authenticate.guard";
import { applyDecorators, UseGuards } from "@nestjs/common";

export const Admin = () =>
  applyDecorators(UseGuards(AuthenticateGuard, AdminGuard));
