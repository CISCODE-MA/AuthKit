<<<<<<< HEAD
import { Test, TestingModule } from '@nestjs/testing';
import { Logger as NestLogger } from '@nestjs/common';
import { LoggerService } from '@services/logger.service';

describe('LoggerService', () => {
=======
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { Logger as NestLogger } from "@nestjs/common";
import { LoggerService } from "@services/logger.service";

describe("LoggerService", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let service: LoggerService;
  let nestLoggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);

    // Spy on NestJS Logger methods
<<<<<<< HEAD
    nestLoggerSpy = jest.spyOn(NestLogger.prototype, 'log').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'error').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'warn').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'debug').mockImplementation();
    jest.spyOn(NestLogger.prototype, 'verbose').mockImplementation();
=======
    nestLoggerSpy = jest
      .spyOn(NestLogger.prototype, "log")
      .mockImplementation();
    jest.spyOn(NestLogger.prototype, "error").mockImplementation();
    jest.spyOn(NestLogger.prototype, "warn").mockImplementation();
    jest.spyOn(NestLogger.prototype, "debug").mockImplementation();
    jest.spyOn(NestLogger.prototype, "verbose").mockImplementation();
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should call NestJS logger.log with message', () => {
      const message = 'Test log message';
=======
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("log", () => {
    it("should call NestJS logger.log with message", () => {
      const message = "Test log message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.log(message);

      expect(NestLogger.prototype.log).toHaveBeenCalledWith(message, undefined);
    });

<<<<<<< HEAD
    it('should call NestJS logger.log with message and context', () => {
      const message = 'Test log message';
      const context = 'TestContext';
=======
    it("should call NestJS logger.log with message and context", () => {
      const message = "Test log message";
      const context = "TestContext";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.log(message, context);

      expect(NestLogger.prototype.log).toHaveBeenCalledWith(message, context);
    });
  });

<<<<<<< HEAD
  describe('error', () => {
    it('should call NestJS logger.error with message only', () => {
      const message = 'Test error message';
=======
  describe("error", () => {
    it("should call NestJS logger.error with message only", () => {
      const message = "Test error message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.error(message);

      expect(NestLogger.prototype.error).toHaveBeenCalledWith(
        message,
        undefined,
        undefined,
      );
    });

<<<<<<< HEAD
    it('should call NestJS logger.error with message and trace', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';
=======
    it("should call NestJS logger.error with message and trace", () => {
      const message = "Test error message";
      const trace = "Error stack trace";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.error(message, trace);

      expect(NestLogger.prototype.error).toHaveBeenCalledWith(
        message,
        trace,
        undefined,
      );
    });

<<<<<<< HEAD
    it('should call NestJS logger.error with message, trace, and context', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';
      const context = 'TestContext';
=======
    it("should call NestJS logger.error with message, trace, and context", () => {
      const message = "Test error message";
      const trace = "Error stack trace";
      const context = "TestContext";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.error(message, trace, context);

      expect(NestLogger.prototype.error).toHaveBeenCalledWith(
        message,
        trace,
        context,
      );
    });
  });

<<<<<<< HEAD
  describe('warn', () => {
    it('should call NestJS logger.warn with message', () => {
      const message = 'Test warning message';
=======
  describe("warn", () => {
    it("should call NestJS logger.warn with message", () => {
      const message = "Test warning message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.warn(message);

      expect(NestLogger.prototype.warn).toHaveBeenCalledWith(
        message,
        undefined,
      );
    });

<<<<<<< HEAD
    it('should call NestJS logger.warn with message and context', () => {
      const message = 'Test warning message';
      const context = 'TestContext';
=======
    it("should call NestJS logger.warn with message and context", () => {
      const message = "Test warning message";
      const context = "TestContext";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.warn(message, context);

      expect(NestLogger.prototype.warn).toHaveBeenCalledWith(message, context);
    });
  });

<<<<<<< HEAD
  describe('debug', () => {
    it('should call NestJS logger.debug in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';
=======
  describe("debug", () => {
    it("should call NestJS logger.debug in development mode", () => {
      process.env.NODE_ENV = "development";
      const message = "Test debug message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.debug(message);

      expect(NestLogger.prototype.debug).toHaveBeenCalledWith(
        message,
        undefined,
      );
    });

<<<<<<< HEAD
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
=======
    it("should call NestJS logger.debug with context in development mode", () => {
      process.env.NODE_ENV = "development";
      const message = "Test debug message";
      const context = "TestContext";

      service.debug(message, context);

      expect(NestLogger.prototype.debug).toHaveBeenCalledWith(message, context);
    });

    it("should NOT call NestJS logger.debug in production mode", () => {
      process.env.NODE_ENV = "production";
      const message = "Test debug message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.debug(message);

      expect(NestLogger.prototype.debug).not.toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
  describe('verbose', () => {
    it('should call NestJS logger.verbose in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test verbose message';
=======
  describe("verbose", () => {
    it("should call NestJS logger.verbose in development mode", () => {
      process.env.NODE_ENV = "development";
      const message = "Test verbose message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.verbose(message);

      expect(NestLogger.prototype.verbose).toHaveBeenCalledWith(
        message,
        undefined,
      );
    });

<<<<<<< HEAD
    it('should call NestJS logger.verbose with context in development mode', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test verbose message';
      const context = 'TestContext';
=======
    it("should call NestJS logger.verbose with context in development mode", () => {
      process.env.NODE_ENV = "development";
      const message = "Test verbose message";
      const context = "TestContext";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.verbose(message, context);

      expect(NestLogger.prototype.verbose).toHaveBeenCalledWith(
        message,
        context,
      );
    });

<<<<<<< HEAD
    it('should NOT call NestJS logger.verbose in production mode', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test verbose message';
=======
    it("should NOT call NestJS logger.verbose in production mode", () => {
      process.env.NODE_ENV = "production";
      const message = "Test verbose message";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      service.verbose(message);

      expect(NestLogger.prototype.verbose).not.toHaveBeenCalled();
    });
  });
});
<<<<<<< HEAD


=======
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
