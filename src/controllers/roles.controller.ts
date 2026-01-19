import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import Role from '../models/role.model';

@Controller('api/auth/roles')
export class RolesController {
  @Post()
  async createRole(@Req() req: Request, @Res() res: Response) {
    try {
      const { name, description, permissions } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Role name is required.' });
      }
      const newRole = new Role({ name, description, permissions });
      await newRole.save();
      return res.status(201).json(newRole);
    } catch (error: any) {
      console.error('Error creating role:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Get()
  async getRoles(@Req() req: Request, @Res() res: Response) {
    try {
      const roles = await (Role as any).paginate({}, { page: 1, limit: 100 });
      return res.status(200).json(roles);
    } catch (error: any) {
      console.error('Error retrieving roles:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Put(':id')
  async updateRole(@Req() req: Request, @Res() res: Response) {
    try {
      const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedRole) {
        return res.status(404).json({ message: 'Role not found.' });
      }
      return res.status(200).json(updatedRole);
    } catch (error: any) {
      console.error('Error updating role:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Delete(':id')
  async deleteRole(@Req() req: Request, @Res() res: Response) {
    try {
      const deletedRole = await Role.findByIdAndDelete(req.params.id);
      if (!deletedRole) {
        return res.status(404).json({ message: 'Role not found.' });
      }
      return res.status(200).json({ message: 'Role deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting role:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}
