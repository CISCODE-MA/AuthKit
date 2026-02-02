import { GlobalExceptionFilter } from '@filters/http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
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
      url: '/api/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    } as ArgumentsHost;

    process.env.NODE_ENV = 'test'; // Disable logging in tests
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Not found',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation error', errors: ['field1', 'field2'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Validation error',
        errors: ['field1', 'field2'],
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle HttpException with object response without message', () => {
      const exception = new HttpException({}, HttpStatus.UNAUTHORIZED);
      exception.message = 'Unauthorized access';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized access',
        }),
      );
    });
  });

  describe('MongoDB error handling', () => {
    it('should handle MongoDB duplicate key error (code 11000)', () => {
      const exception = {
        code: 11000,
        message: 'E11000 duplicate key error',
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 409,
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
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
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
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Invalid resource identifier',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });
  });

  describe('Unknown error handling', () => {
    it('should handle unknown errors as 500', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'An unexpected error occurred',
        timestamp: expect.any(String),
        path: '/api/test',
      });
    });

    it('should handle null/undefined exceptions', () => {
      filter.catch(null, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'An unexpected error occurred',
        }),
      );
    });
  });

  describe('Development mode features', () => {
    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at ...';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: exception.stack,
        }),
      );
    });

    it('should NOT include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at ...';

      filter.catch(exception, mockArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });

    it('should NOT include stack trace in test mode', () => {
      process.env.NODE_ENV = 'test';
      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at ...';

      filter.catch(exception, mockArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });
  });

  describe('Response format', () => {
    it('should always include statusCode, message, timestamp, and path', () => {
      const exception = new HttpException('Test', HttpStatus.OK);

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

    it('should include errors field only when errors exist', () => {
      const exceptionWithoutErrors = new HttpException('Test', HttpStatus.OK);
      filter.catch(exceptionWithoutErrors, mockArgumentsHost);

      const responseWithoutErrors = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseWithoutErrors.errors).toBeUndefined();

      jest.clearAllMocks();

      const exceptionWithErrors = new HttpException(
        { message: 'Test', errors: ['error1'] },
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exceptionWithErrors, mockArgumentsHost);

      const responseWithErrors = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseWithErrors.errors).toEqual(['error1']);
    });
  });
});


