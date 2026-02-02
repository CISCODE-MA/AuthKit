import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { MailService } from '@services/mail.service';
import { LoggerService } from '@services/logger.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockMailService: jest.Mocked<MailService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    mockMailService = {
      verifyConnection: jest.fn(),
    } as any;

    mockLoggerService = {
      error: jest.fn(),
      log: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: MailService, useValue: mockMailService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkSmtp', () => {
    it('should return connected status when SMTP is working', async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: true,
      });

      const result = await controller.checkSmtp();

      expect(result).toMatchObject({
        service: 'smtp',
        status: 'connected',
      });
      expect((result as any).config).toBeDefined();
      expect(mockMailService.verifyConnection).toHaveBeenCalled();
    });

    it('should return disconnected status when SMTP fails', async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: false,
        error: 'Connection timeout',
      });

      const result = await controller.checkSmtp();

      expect(result).toMatchObject({
        service: 'smtp',
        status: 'disconnected',
        error: 'Connection timeout',
      });
      expect(mockMailService.verifyConnection).toHaveBeenCalled();
    });

    it('should handle exceptions and log errors', async () => {
      const error = new Error('SMTP crashed');
      mockMailService.verifyConnection.mockRejectedValue(error);

      const result = await controller.checkSmtp();

      expect(result).toMatchObject({
        service: 'smtp',
        status: 'error',
      });
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('SMTP health check failed'),
        error.stack,
        'HealthController',
      );
    });

    it('should mask sensitive config values', async () => {
      process.env.SMTP_USER = 'testuser@example.com';
      mockMailService.verifyConnection.mockResolvedValue({ connected: true });

      const result = await controller.checkSmtp();

      expect((result as any).config.user).toMatch(/^\*\*\*/);
      expect((result as any).config.user).not.toContain('testuser');
    });
  });

  describe('checkAll', () => {
    it('should return overall health status', async () => {
      mockMailService.verifyConnection.mockResolvedValue({ connected: true });

      const result = await controller.checkAll();

      expect(result).toMatchObject({
        status: 'healthy',
        checks: {
          smtp: expect.objectContaining({ service: 'smtp' }),
        },
        environment: expect.any(Object),
      });
    });

    it('should return degraded status when SMTP fails', async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: false,
        error: 'Connection failed',
      });

      const result = await controller.checkAll();

      expect(result.status).toBe('degraded');
      expect(result.checks.smtp.status).toBe('disconnected');
    });
  });
});
