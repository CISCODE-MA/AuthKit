import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RolesService } from '@services/roles.service';
import { CreateRoleDto } from '@dtos/role/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionsDto } from '@dtos/role/update-role.dto';
import { Admin } from '@middleware/admin.decorator';

@Admin()
@Controller('api/admin/roles')
export class RolesController {
  constructor(private readonly roles: RolesService) { }

  @Post()
  async create(@Body() dto: CreateRoleDto, @Res() res: Response) {
    const result = await this.roles.create(dto);
    return res.status(201).json(result);
  }

  @Get()
  async list(@Res() res: Response) {
    const result = await this.roles.list();
    return res.status(200).json(result);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Res() res: Response) {
    const result = await this.roles.update(id, dto);
    return res.status(200).json(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.roles.delete(id);
    return res.status(200).json(result);
  }

  @Put(':id/permissions')
  async setPermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto, @Res() res: Response) {
    const result = await this.roles.setPermissions(id, dto.permissions);
    return res.status(200).json(result);
  }

}
