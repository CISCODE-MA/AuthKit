import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from '@api/guards/authenticate.guard';
import { AdminGuard } from '@api/guards/admin.guard';

export const Admin = () =>
    applyDecorators(
        UseGuards(AuthenticateGuard, AdminGuard)
    );
