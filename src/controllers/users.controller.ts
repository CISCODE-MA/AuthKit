import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { UsersService } from '@services/users.service';
import { RegisterDto } from '@dto/auth/register.dto';
import { Admin } from '@decorators/admin.decorator';
import { UpdateUserRolesDto } from '@dto/auth/update-user-role.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Admin()
@Controller('api/admin/users')
export class UsersController {
  constructor(private readonly users: UsersService) { }

  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Post()
  async create(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.users.create(dto);
    return res.status(201).json(result);
  }

  @ApiOperation({ summary: 'List all users with optional filters' })
  @ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
  @ApiQuery({ name: 'username', required: false, description: 'Filter by username' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Get()
  async list(@Query() query: { email?: string; username?: string }, @Res() res: Response) {
    const result = await this.users.list(query);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Ban a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User banned successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Patch(':id/ban')
  async ban(@Param('id') id: string, @Res() res: Response) {
    const result = await this.users.setBan(id, true);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Unban a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Patch(':id/unban')
  async unban(@Param('id') id: string, @Res() res: Response) {
    const result = await this.users.setBan(id, false);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.users.delete(id);
    return res.status(200).json(result);
  }

  @ApiOperation({ summary: 'Update user roles' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required.' })
  @Patch(':id/roles')
  async updateRoles(@Param('id') id: string, @Body() dto: UpdateUserRolesDto, @Res() res: Response) {
    const result = await this.users.updateRoles(id, dto.roles);
    return res.status(200).json(result);
  }

}
