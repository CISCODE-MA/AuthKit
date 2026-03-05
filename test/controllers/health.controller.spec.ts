<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '@controllers/health.controller';
import { MailService } from '@services/mail.service';
import { LoggerService } from '@services/logger.service';

describe('HealthController', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { HealthController } from "@controllers/health.controller";
import { MailService } from "@services/mail.service";
import { LoggerService } from "@services/logger.service";

describe("HealthController", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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

<<<<<<< HEAD
  describe('checkSmtp', () => {
    it('should return connected status when SMTP is working', async () => {
=======
  describe("checkSmtp", () => {
    it("should return connected status when SMTP is working", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockMailService.verifyConnection.mockResolvedValue({
        connected: true,
      });

      const result = await controller.checkSmtp();

      expect(result).toMatchObject({
<<<<<<< HEAD
        service: 'smtp',
        status: 'connected',
=======
        service: "smtp",
        status: "connected",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });
      expect((result as any).config).toBeDefined();
      expect(mockMailService.verifyConnection).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should return disconnected status when SMTP fails', async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: false,
        error: 'Connection timeout',
=======
    it("should return disconnected status when SMTP fails", async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: false,
        error: "Connection timeout",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      const result = await controller.checkSmtp();

      expect(result).toMatchObject({
<<<<<<< HEAD
        service: 'smtp',
        status: 'disconnected',
        error: 'Connection timeout',
=======
        service: "smtp",
        status: "disconnected",
        error: "Connection timeout",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });
      expect(mockMailService.verifyConnection).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should handle exceptions and log errors', async () => {
      const error = new Error('SMTP crashed');
=======
    it("should handle exceptions and log errors", async () => {
      const error = new Error("SMTP crashed");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockMailService.verifyConnection.mockRejectedValue(error);

      const result = await controller.checkSmtp();

      expect(result).toMatchObject({
<<<<<<< HEAD
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
=======
        service: "smtp",
        status: "error",
      });
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining("SMTP health check failed"),
        error.stack,
        "HealthController",
      );
    });

    it("should mask sensitive config values", async () => {
      process.env.SMTP_USER = "testuser@example.com";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockMailService.verifyConnection.mockResolvedValue({ connected: true });

      const result = await controller.checkSmtp();

      expect((result as any).config.user).toMatch(/^\*\*\*/);
<<<<<<< HEAD
      expect((result as any).config.user).not.toContain('testuser');
    });
  });

  describe('checkAll', () => {
    it('should return overall health status', async () => {
=======
      expect((result as any).config.user).not.toContain("testuser");
    });
  });

  describe("checkAll", () => {
    it("should return overall health status", async () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      mockMailService.verifyConnection.mockResolvedValue({ connected: true });

      const result = await controller.checkAll();

      expect(result).toMatchObject({
<<<<<<< HEAD
        status: 'healthy',
        checks: {
          smtp: expect.objectContaining({ service: 'smtp' }),
=======
        status: "healthy",
        checks: {
          smtp: expect.objectContaining({ service: "smtp" }),
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        },
        environment: expect.any(Object),
      });
    });

<<<<<<< HEAD
    it('should return degraded status when SMTP fails', async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: false,
        error: 'Connection failed',
=======
    it("should return degraded status when SMTP fails", async () => {
      mockMailService.verifyConnection.mockResolvedValue({
        connected: false,
        error: "Connection failed",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });

      const result = await controller.checkAll();

<<<<<<< HEAD
      expect(result.status).toBe('degraded');
      expect(result.checks.smtp.status).toBe('disconnected');
    });
  });
});


=======
      expect(result.status).toBe("degraded");
      expect(result.checks.smtp.status).toBe("disconnected");
    });
  });
});
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
