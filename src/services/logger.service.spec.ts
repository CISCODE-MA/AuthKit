import { Test, TestingModule } from '@nestjs/testing';
import { Logger as NestLogger } from '@nestjs/common';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let nestLoggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);

    // Spy on NestJS Logger methods
    nestLoggerSpy = jest.spyOn(NestLogger.prototype, 'log').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'error').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'warn').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'debug').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'verbose').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should call NestJS logger.log with message', () => {
      const message = 'Test log message';

      service.log(message);

      expect(NestLogger.prototype.log).toHaveBeenCalledWith(message, undefined);
    });

    it('should call NestJS logger.log with message and context', () => {
      const message = 'Test log message';
      const context = 'TestContext';

      service.log(message, context);

      expect(NestLogger.prototype.log).toHaveBeenCalledWith(message, context);
    });
  });

  describe('error', () => {
    it('should call NestJS logger.error with message only', () => {
      const message = 'Test error message';

      service.error(message);

      expect(NestLogger.prototype.error).toHaveBeenCalledWith(
        message,
        undefined,
        undefined,
      );
    });

    it('should call NestJS logger.error with message and trace', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';

      service.error(message, trace);

      expect(NestLogger.prototype.error).toHaveBeenCalledWith(
        message,
        trace,
        undefined,
      );
    });

    it('should call NestJS logger.error with message, trace, and context', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';
      const context = 'TestContext';

      service.error(message, trace, context);

      expect(NestLogger.prototype.error).toHaveBeenCalledWith(
        message,
        trace,
        context,
      );
    });
  });

  describe('warn', () => {
    it('should call NestJS logger.warn with message', () => {
      const message = 'Test warning message';

      service.warn(message);

      expect(NestLogger.prototype.warn).toHaveBeenCalledWith(
        message,
        undefined,
      );
    });

    it('should call NestJS logger.warn with message and context', () => {
      const message = 'Test warning message';
      const context = 'TestContext';

      service.warn(message, context);

      expect(NestLogger.prototype.warn).toHaveBeenCalledWith(message, context);
    });
  });

  describe('debug', () => {
    it('should call NestJS logger.debug in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';

      service.debug(message);

      expect(NestLogger.prototype.debug).toHaveBeenCalledWith(
        message,
        undefined,
      );
    });

    it('should call NestJS logger.debug with context in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';
      const context = 'TestContext';

      service.debug(message, context);

      expect(NestLogger.prototype.debug).toHaveBeenCalledWith(
        message,
        context,
      );
    });

    it('should NOT call NestJS logger.debug in production mode', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test debug message';

      service.debug(message);

      expect(NestLogger.prototype.debug).not.toHaveBeenCalled();
    });
  });

  describe('verbose', () => {
    it('should call NestJS logger.verbose in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test verbose message';

      service.verbose(message);

      expect(NestLogger.prototype.verbose).toHaveBeenCalledWith(
        message,
        undefined,
      );
    });

    it('should call NestJS logger.verbose with context in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test verbose message';
      const context = 'TestContext';

      service.verbose(message, context);

      expect(NestLogger.prototype.verbose).toHaveBeenCalledWith(
        message,
        context,
      );
    });

    it('should NOT call NestJS logger.verbose in production mode', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test verbose message';

      service.verbose(message);

      expect(NestLogger.prototype.verbose).not.toHaveBeenCalled();
    });
  });
});
