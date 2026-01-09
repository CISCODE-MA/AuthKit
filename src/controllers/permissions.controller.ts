import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import Permission from '../models/permission.model';

@Controller('api/auth/permissions')
export class PermissionsController {
  @Post('add-permission')
  async createPermission(@Req() req: Request, @Res() res: Response) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Permission name is required.' });
      }

      const newPermission = new Permission({ name, description });
      await newPermission.save();
      return res.status(201).json(newPermission);
    } catch (error: any) {
      console.error('Error creating permission:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Get('get-permission')
  async getPermissions(@Req() req: Request, @Res() res: Response) {
    try {
      const { page, limit } = req.query;
      const permissions = await (Permission as any).paginate({}, {
        page: parseInt(page as string, 10) || 1,
        limit: parseInt(limit as string, 10) || 10
      });
      return res.status(200).json(permissions);
    } catch (error: any) {
      console.error('Error retrieving permissions:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Put('update-permission/:id')
  async updatePermission(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const updatedPermission = await Permission.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedPermission) {
        return res.status(404).json({ message: 'Permission not found.' });
      }
      return res.status(200).json(updatedPermission);
    } catch (error: any) {
      console.error('Error updating permission:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Delete('delete-permission/:id')
  async deletePermission(@Req() req: Request, @Res() res: Response) {
    try {
      const { id } = req.params;
      const deletedPermission = await Permission.findByIdAndDelete(id);
      if (!deletedPermission) {
        return res.status(404).json({ message: 'Permission not found.' });
      }
      return res.status(200).json({ message: 'Permission deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}
