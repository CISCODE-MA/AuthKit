import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '@services/users.service';
import { RegisterDto } from '@dtos/auth/register.dto';
import { Admin } from '@middleware/admin.decorator';

@Admin()
@Controller('api/admin/users')
export class UsersController {
  constructor(private readonly users: UsersService) { }

  @Post()
  async create(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.users.create(dto);
    return res.status(201).json(result);
  }

  @Get()
  async list(@Query() query: { email?: string; username?: string }, @Res() res: Response) {
    const result = await this.users.list(query);
    return res.status(200).json(result);
  }

  @Patch(':id/ban')
  async ban(@Param('id') id: string, @Res() res: Response) {
    const result = await this.users.setBan(id, true);
    return res.status(200).json(result);
  }

  @Patch(':id/unban')
  async unban(@Param('id') id: string, @Res() res: Response) {
    const result = await this.users.setBan(id, false);
    return res.status(200).json(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.users.delete(id);
    return res.status(200).json(result);
  }
}
