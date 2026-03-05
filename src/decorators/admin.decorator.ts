<<<<<<< HEAD
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from '@guards/authenticate.guard';
import { AdminGuard } from '@guards/admin.guard';

export const Admin = () =>
    applyDecorators(
        UseGuards(AuthenticateGuard, AdminGuard)
    );
=======
import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthenticateGuard } from "@guards/authenticate.guard";
import { AdminGuard } from "@guards/admin.guard";

export const Admin = () =>
  applyDecorators(UseGuards(AuthenticateGuard, AdminGuard));
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
