import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from '@middleware/authenticate.guard';
import { AdminGuard } from '@middleware/admin.guard';

export const Admin = () =>
    applyDecorators(
        UseGuards(AuthenticateGuard, AdminGuard)
    );
