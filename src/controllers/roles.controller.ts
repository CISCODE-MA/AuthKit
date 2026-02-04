import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { RolesService } from '@services/roles.service';
import { CreateRoleDto } from '@dto/role/create-role.dto';
import { UpdateRoleDto, UpdateRolePermissionsDto } from '@dto/role/update-role.dto';
import { Admin } from '@decorators/admin.decorator';

@ApiTags('Admin - Roles')
@ApiBearerAuth()
@Admin()
@Controller('api/admin/roles')
export class RolesController {
  constructor(private readonly roles: RolesService) { }

  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @ApiResponse({ status: 409, description: 'Role name already exists.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Post()
  async create(@Body() dto: CreateRoleDto, @Res() res: Response) {
    const result = await this.roles.create(dto);
    return res.status(201).json(result);
  }

  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Get()
  async list(@Res() res: Response) {
    const result = await this.roles.list();
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Res() res: Response) {
    const result = await this.roles.update(id, dto);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.roles.delete(id);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Set permissions for a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role permissions updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Put(':id/permissions')
  async setPermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto, @Res() res: Response) {
    const result = await this.roles.setPermissions(id, dto.permissions);
    return res.status(200).json(result);
  }

}
