import { Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/user.model';
import Client from '../models/client.model';

const ACCOUNT_TYPES = ['user', 'client'] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

const isAccountType = (value: unknown): value is AccountType => ACCOUNT_TYPES.includes(value as AccountType);

const getModel = (type: AccountType) => (type === 'user' ? User : Client);

@Controller('api/auth')
export class PasswordResetController {
  private async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email, type } = req.body;

      if (!email || !type) {
        return res.status(400).json({ message: 'Email and type are required.' });
      }

      if (!isAccountType(type)) {
        return res.status(400).json({ message: 'Invalid account type.' });
      }

      const Model = getModel(type);
      const account = await Model.findOne({ email });

      if (!account) {
        return res.status(200).json({
          message: 'If that email address is in our system, a password reset link has been sent.'
        });
      }

      const token = randomBytes(20).toString('hex');
      account.resetPasswordToken = token;
      account.resetPasswordExpires = Date.now() + 3600000;

      await account.save();

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&type=${type}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: account.email,
        subject: 'Password Reset',
        text: `You are receiving this email because you (or someone else) requested a password reset.
Please click the link below, or paste it into your browser:
${resetUrl}

If you did not request this, please ignore this email.
This link will expire in 1 hour.`
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        message: 'If that email address is in our system, a password reset link has been sent.'
      });
    } catch (error: any) {
      console.error('Error in requestPasswordReset:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  private async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, type } = req.body;

      if (!token || !newPassword || !type) {
        return res.status(400).json({ message: 'Token, new password, and type are required.' });
      }

      if (!isAccountType(type)) {
        return res.status(400).json({ message: 'Invalid account type.' });
      }

      const Model = getModel(type);

      const account = await Model.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!account) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      const salt = await bcrypt.genSalt(10);
      account.password = await bcrypt.hash(newPassword, salt);
      account.resetPasswordToken = undefined;
      account.resetPasswordExpires = undefined;

      await account.save();

      return res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Post('forgot-password')
  forgotPassword(@Req() req: Request, @Res() res: Response) {
    return this.requestPasswordReset(req, res);
  }

  @Post('request-password-reset')
  requestPasswordResetRoute(@Req() req: Request, @Res() res: Response) {
    return this.requestPasswordReset(req, res);
  }

  @Post('reset-password')
  resetPasswordRoute(@Req() req: Request, @Res() res: Response) {
    return this.resetPassword(req, res);
  }
}
