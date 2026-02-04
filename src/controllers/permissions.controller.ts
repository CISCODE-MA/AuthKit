import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { PermissionsService } from '@services/permissions.service';
import { CreatePermissionDto } from '@dto/permission/create-permission.dto';
import { UpdatePermissionDto } from '@dto/permission/update-permission.dto';
import { Admin } from '@decorators/admin.decorator';

@ApiTags('Admin - Permissions')
@ApiBearerAuth()
@Admin()
@Controller('api/admin/permissions')
export class PermissionsController {
  constructor(private readonly perms: PermissionsService) { }

  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully.' })
  @ApiResponse({ status: 409, description: 'Permission name already exists.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Post()
  async create(@Body() dto: CreatePermissionDto, @Res() res: Response) {
    const result = await this.perms.create(dto);
    return res.status(201).json(result);
  }

  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Get()
  async list(@Res() res: Response) {
    const result = await this.perms.list();
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto, @Res() res: Response) {
    const result = await this.perms.update(id, dto);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.perms.delete(id);
    return res.status(200).json(result);
  }
}
