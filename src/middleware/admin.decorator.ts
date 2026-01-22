import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from '@middleware/authenticate.guard';
import { hasRole } from '@middleware/role.guard';

export const Admin = () =>
    applyDecorators(
        UseGuards(AuthenticateGuard, hasRole(process.env.ADMIN_ROLE_ID as string))
    );
