import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from '@guards/authenticate.guard';
import { AdminGuard } from '@guards/admin.guard';

export const Admin = () =>
    applyDecorators(
        UseGuards(AuthenticateGuard, AdminGuard)
    );
