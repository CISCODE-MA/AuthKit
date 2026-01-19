import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import User from '../models/user.model';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

@Controller('api/users')
export class UsersController {
  @Post()
  async createUser(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, password, name, microsoftId, roles, jobTitle, company } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
      if (!microsoftId && !password) {
        return res.status(400).json({ message: 'Password is required for local login.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = password ? await bcrypt.hash(password, salt) : undefined;

      const status = 'pending';
      const tokenExpiryHours = parseFloat(process.env.EMAIL_TOKEN_EXPIRATION_HOURS || '0') || 24;
      const tokenExpiration = Date.now() + tokenExpiryHours * 60 * 60 * 1000;
      const confirmationToken = randomBytes(20).toString('hex');

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        microsoftId,
        roles,
        jobTitle,
        company,
        status,
        resetPasswordToken: confirmationToken,
        resetPasswordExpires: tokenExpiration
      });

      await newUser.save();

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Confirm Your Email Address',
        text: `Hello,

Thank you for registering. Please confirm your account by clicking the link below:

${confirmationUrl}

This link will expire in ${tokenExpiryHours} hour(s).

If you did not initiate this registration, please ignore this email.

Thank you.`
      };

      await transporter.sendMail(mailOptions);

      return res.status(201).json({ message: 'User created and confirmation email sent successfully.', user: newUser });
    } catch (error: any) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Put(':id')
  async updateUser(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.params.id;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Delete(':id')
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.params.id;
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Post('invite')
  async createUserInvitation(@Req() req: Request, @Res() res: Response) {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const token = randomBytes(20).toString('hex');
      const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

      const newUser = new User({
        email,
        name,
        resetPasswordToken: token,
        resetPasswordExpires: tokenExpiration
      });
      await newUser.save();

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const invitationUrl = `${process.env.FRONTEND_URL}/set-password?token=${token}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "You're invited: Set up your password",
        text: `Hello,

You have been invited to join our platform. Please click on the link below to set your password and complete your registration:

${invitationUrl}

This link will expire in 24 hours. If you did not request this or believe it to be in error, please ignore this email.

Thank you!`
      };

      await transporter.sendMail(mailOptions);
      return res.status(201).json({ message: 'Invitation sent successfully. Please check your email.' });
    } catch (error: any) {
      console.error('Error in createUserInvitation:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  @Get()
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    try {
      const filter: any = {};
      if (req.query.email) filter.email = req.query.email;

      const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const skip = (page - 1) * limit;

      const [totalItems, users] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
          .populate({ path: 'roles', select: '-__v' })
          .skip(skip)
          .limit(limit)
          .lean()
      ]);

      return res.status(200).json({
        data: users,
        pagination: {
          totalItems,
          limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
          currentPage: page,
          hasNextPage: page * limit < totalItems,
          hasPrevPage: page > 1
        }
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}
