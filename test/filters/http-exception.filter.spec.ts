<<<<<<< HEAD
import { GlobalExceptionFilter } from '@filters/http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
=======
import { GlobalExceptionFilter } from "@filters/http-exception.filter";
import type { ArgumentsHost } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

describe("GlobalExceptionFilter", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
<<<<<<< HEAD
      url: '/api/test',
      method: 'GET',
=======
      url: "/api/test",
      method: "GET",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
    };

    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    } as ArgumentsHost;

<<<<<<< HEAD
    process.env.NODE_ENV = 'test'; // Disable logging in tests
=======
    process.env.NODE_ENV = "test"; // Disable logging in tests
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  describe('HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
=======
  describe("HttpException handling", () => {
    it("should handle HttpException with string response", () => {
      const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
<<<<<<< HEAD
        message: 'Not found',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation error', errors: ['field1', 'field2'] },
=======
        message: "Not found",
        timestamp: expect.any(String),
        path: "/api/test",
      });
    });

    it("should handle HttpException with object response", () => {
      const exception = new HttpException(
        { message: "Validation error", errors: ["field1", "field2"] },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
<<<<<<< HEAD
        message: 'Validation error',
        errors: ['field1', 'field2'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle HttpException with object response without message', () => {
      const exception = new HttpException({}, HttpStatus.UNAUTHORIZED);
      exception.message = 'Unauthorized access';
=======
        message: "Validation error",
        errors: ["field1", "field2"],
        timestamp: expect.any(String),
        path: "/api/test",
      });
    });

    it("should handle HttpException with object response without message", () => {
      const exception = new HttpException({}, HttpStatus.UNAUTHORIZED);
      exception.message = "Unauthorized access";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
<<<<<<< HEAD
          message: 'Unauthorized access',
=======
          message: "Unauthorized access",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        }),
      );
    });
  });

<<<<<<< HEAD
  describe('MongoDB error handling', () => {
    it('should handle MongoDB duplicate key error (code 11000)', () => {
      const exception = {
        code: 11000,
        message: 'E11000 duplicate key error',
=======
  describe("MongoDB error handling", () => {
    it("should handle MongoDB duplicate key error (code 11000)", () => {
      const exception = {
        code: 11000,
        message: "E11000 duplicate key error",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 409,
<<<<<<< HEAD
        message: 'Resource already exists',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle Mongoose ValidationError', () => {
      const exception = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: { email: 'Invalid email format' },
=======
        message: "Resource already exists",
        timestamp: expect.any(String),
        path: "/api/test",
      });
    });

    it("should handle Mongoose ValidationError", () => {
      const exception = {
        name: "ValidationError",
        message: "Validation failed",
        errors: { email: "Invalid email format" },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
<<<<<<< HEAD
        message: 'Validation failed',
        errors: { email: 'Invalid email format' },
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle Mongoose CastError', () => {
      const exception = {
        name: 'CastError',
        message: 'Cast to ObjectId failed',
=======
        message: "Validation failed",
        errors: { email: "Invalid email format" },
        timestamp: expect.any(String),
        path: "/api/test",
      });
    });

    it("should handle Mongoose CastError", () => {
      const exception = {
        name: "CastError",
        message: "Cast to ObjectId failed",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
<<<<<<< HEAD
        message: 'Invalid resource identifier',
        timestamp: expect.any(String),
        path: '/api/test',
=======
        message: "Invalid resource identifier",
        timestamp: expect.any(String),
        path: "/api/test",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      });
    });
  });

<<<<<<< HEAD
  describe('Unknown error handling', () => {
    it('should handle unknown errors as 500', () => {
      const exception = new Error('Something went wrong');
=======
  describe("Unknown error handling", () => {
    it("should handle unknown errors as 500", () => {
      const exception = new Error("Something went wrong");
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
<<<<<<< HEAD
        message: 'An unexpected error occurred',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle null/undefined exceptions', () => {
=======
        message: "An unexpected error occurred",
        timestamp: expect.any(String),
        path: "/api/test",
      });
    });

    it("should handle null/undefined exceptions", () => {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      filter.catch(null, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
<<<<<<< HEAD
          message: 'An unexpected error occurred',
=======
          message: "An unexpected error occurred",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        }),
      );
    });
  });

<<<<<<< HEAD
  describe('Development mode features', () => {
    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at ...';
=======
  describe("Development mode features", () => {
    it("should include stack trace in development mode", () => {
      process.env.NODE_ENV = "development";
      const exception = new Error("Test error");
      exception.stack = "Error: Test error\n    at ...";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: exception.stack,
        }),
      );
    });

<<<<<<< HEAD
    it('should NOT include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at ...';
=======
    it("should NOT include stack trace in production mode", () => {
      process.env.NODE_ENV = "production";
      const exception = new Error("Test error");
      exception.stack = "Error: Test error\n    at ...";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });

<<<<<<< HEAD
    it('should NOT include stack trace in test mode', () => {
      process.env.NODE_ENV = 'test';
      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at ...';
=======
    it("should NOT include stack trace in test mode", () => {
      process.env.NODE_ENV = "test";
      const exception = new Error("Test error");
      exception.stack = "Error: Test error\n    at ...";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });
  });

<<<<<<< HEAD
  describe('Response format', () => {
    it('should always include statusCode, message, timestamp, and path', () => {
      const exception = new HttpException('Test', HttpStatus.OK);
=======
  describe("Response format", () => {
    it("should always include statusCode, message, timestamp, and path", () => {
      const exception = new HttpException("Test", HttpStatus.OK);
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
          timestamp: expect.any(String),
          path: expect.any(String),
        }),
      );
    });

<<<<<<< HEAD
    it('should include errors field only when errors exist', () => {
      const exceptionWithoutErrors = new HttpException('Test', HttpStatus.OK);
      filter.catch(exceptionWithoutErrors, mockArgumentsHost);

      const responseWithoutErrors = (mockResponse.json as jest.Mock).mock.calls[0][0];
=======
    it("should include errors field only when errors exist", () => {
      const exceptionWithoutErrors = new HttpException("Test", HttpStatus.OK);
      filter.catch(exceptionWithoutErrors, mockArgumentsHost);

      const responseWithoutErrors = (mockResponse.json as jest.Mock).mock
        .calls[0][0];
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
      expect(responseWithoutErrors.errors).toBeUndefined();

      jest.clearAllMocks();

      const exceptionWithErrors = new HttpException(
<<<<<<< HEAD
        { message: 'Test', errors: ['error1'] },
=======
        { message: "Test", errors: ["error1"] },
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exceptionWithErrors, mockArgumentsHost);

<<<<<<< HEAD
      const responseWithErrors = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseWithErrors.errors).toEqual(['error1']);
    });
  });
});


=======
      const responseWithErrors = (mockResponse.json as jest.Mock).mock
        .calls[0][0];
      expect(responseWithErrors.errors).toEqual(["error1"]);
    });
  });
});
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
