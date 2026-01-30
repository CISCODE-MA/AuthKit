import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PermissionsService } from '@infrastructure/permissions.service';
import { CreatePermissionDto } from '@api/dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '@api/dto/permission/update-permission.dto';
import { Admin } from '@api/guards/admin.decorator';

@Admin()
@Controller('api/admin/permissions')
export class PermissionsController {
  constructor(private readonly perms: PermissionsService) { }

  @Post()
  async create(@Body() dto: CreatePermissionDto, @Res() res: Response) {
    const result = await this.perms.create(dto);
    return res.status(201).json(result);
  }

  @Get()
  async list(@Res() res: Response) {
    const result = await this.perms.list();
    return res.status(200).json(result);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto, @Res() res: Response) {
    const result = await this.perms.update(id, dto);
    return res.status(200).json(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.perms.delete(id);
    return res.status(200).json(result);
  }
}
