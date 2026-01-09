import { Controller, Put, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import User from '../models/user.model';
import { AuthenticateGuard } from '../middleware/authenticate.guard';

@UseGuards(AuthenticateGuard)
@Controller('api/admin')
export class AdminController {
  @Put(':id/suspend')
  async suspendUser(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user || !(req.user as any).roles) {
        return res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
      }

      if (!(req.user as any).roles.includes('superadmin')) {
        return res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'User ID is required in the URL.' });
      }

      const updatedUser = await User.findByIdAndUpdate(id, { status: 'suspended' }, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      return res.status(200).json({ message: 'User suspended successfully.', user: updatedUser });
    } catch (error: any) {
      console.error('Error suspending user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}
