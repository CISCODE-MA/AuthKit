import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { MailService } from '@services/mail.service';
import { LoggerService } from '@services/logger.service';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let mockLogger: any;
  let mockTransporter: any;

  beforeEach(async () => {
    // Reset environment variables
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'password';
    process.env.FROM_EMAIL = 'noreply@example.com';
    process.env.FRONTEND_URL = 'http://localhost:3001';
    process.env.BACKEND_URL = 'http://localhost:3000';

    // Mock transporter
    mockTransporter = {
      verify: jest.fn(),
      sendMail: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Mock logger
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialization', () => {
    it('should initialize transporter with SMTP configuration', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password',
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });
    });

    it('should warn and disable email when SMTP not configured', async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: LoggerService,
            useValue: mockLogger,
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'SMTP not configured - email functionality will be disabled',
        'MailService',
      );
    });

    it('should handle transporter initialization error', async () => {
      (nodemailer.createTransport as jest.Mock).mockImplementation(() => {
        throw new Error('Transporter creation failed');
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: LoggerService,
            useValue: mockLogger,
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize SMTP transporter'),
        expect.any(String),
        'MailService',
      );
    });
  });

  describe('verifyConnection', () => {
    it('should verify SMTP connection successfully', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await service.verifyConnection();

      expect(result).toEqual({ connected: true });
      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'SMTP connection verified successfully',
        'MailService',
      );
    });

    it('should return error when SMTP not configured', async () => {
      delete process.env.SMTP_HOST;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: LoggerService,
            useValue: mockLogger,
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);

      const result = await testService.verifyConnection();

      expect(result).toEqual({
        connected: false,
        error: 'SMTP not configured',
      });
    });

    it('should handle SMTP connection error', async () => {
      const error = new Error('Connection failed');
      mockTransporter.verify.mockRejectedValue(error);

      const result = await service.verifyConnection();

      expect(result).toEqual({
        connected: false,
        error: 'SMTP connection failed: Connection failed',
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'SMTP connection failed: Connection failed',
        expect.any(String),
        'MailService',
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: '123' });

      await service.sendVerificationEmail('user@example.com', 'test-token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: 'Verify your email',
        text: expect.stringContaining('test-token'),
        html: expect.stringContaining('test-token'),
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Verification email sent to user@example.com',
        'MailService',
      );
    });

    it('should throw error when SMTP not configured', async () => {
      delete process.env.SMTP_HOST;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: LoggerService,
            useValue: mockLogger,
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);

      await expect(
        testService.sendVerificationEmail('user@example.com', 'test-token'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Attempted to send email but SMTP is not configured',
        '',
        'MailService',
      );
    });

    it('should handle SMTP send error', async () => {
      const error = new Error('Send failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendVerificationEmail('user@example.com', 'test-token'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send verification email'),
        expect.any(String),
        'MailService',
      );
    });

    it('should handle SMTP authentication error', async () => {
      const error: any = new Error('Auth failed');
      error.code = 'EAUTH';
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendVerificationEmail('user@example.com', 'test-token'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'SMTP authentication failed. Check SMTP_USER and SMTP_PASS',
        ),
        expect.any(String),
        'MailService',
      );
    });

    it('should handle SMTP connection timeout', async () => {
      const error: any = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendVerificationEmail('user@example.com', 'test-token'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('SMTP connection timed out'),
        expect.any(String),
        'MailService',
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: '456' });

      await service.sendPasswordResetEmail('user@example.com', 'reset-token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: 'Reset your password',
        text: expect.stringContaining('reset-token'),
        html: expect.stringContaining('reset-token'),
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Password reset email sent to user@example.com',
        'MailService',
      );
    });

    it('should throw error when SMTP not configured', async () => {
      delete process.env.SMTP_HOST;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: LoggerService,
            useValue: mockLogger,
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);

      await expect(
        testService.sendPasswordResetEmail('user@example.com', 'reset-token'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle SMTP server error (5xx)', async () => {
      const error: any = new Error('Server error');
      error.responseCode = 554;
      error.response = 'Transaction failed';
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendPasswordResetEmail('user@example.com', 'reset-token'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('SMTP server error (554)'),
        expect.any(String),
        'MailService',
      );
    });

    it('should handle SMTP client error (4xx)', async () => {
      const error: any = new Error('Client error');
      error.responseCode = 450;
      error.response = 'Requested action not taken';
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendPasswordResetEmail('user@example.com', 'reset-token'),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('SMTP client error (450)'),
        expect.any(String),
        'MailService',
      );
    });
  });
});


