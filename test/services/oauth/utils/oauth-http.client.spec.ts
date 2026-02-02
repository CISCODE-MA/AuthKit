import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { OAuthHttpClient } from '@services/oauth/utils/oauth-http.client';
import { LoggerService } from '@services/logger.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuthHttpClient', () => {
  let client: OAuthHttpClient;
  let mockLogger: any;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: LoggerService, useValue: mockLogger }],
    }).compile();

    const logger = module.get<LoggerService>(LoggerService);
    client = new OAuthHttpClient(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should perform GET request successfully', async () => {
      const responseData = { id: '123', name: 'Test' };
      mockedAxios.get.mockResolvedValue({ data: responseData });

      const result = await client.get('https://api.example.com/user');

      expect(result).toEqual(responseData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/user',
        expect.objectContaining({ timeout: 10000 }),
      );
    });

    it('should merge custom config with default timeout', async () => {
      mockedAxios.get.mockResolvedValue({ data: { success: true } });

      await client.get('https://api.example.com/data', {
        headers: { Authorization: 'Bearer token' },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          timeout: 10000,
          headers: { Authorization: 'Bearer token' },
        }),
      );
    });

    it('should throw InternalServerErrorException on timeout', async () => {
      const timeoutError: any = new Error('Timeout');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(client.get('https://api.example.com/slow')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(client.get('https://api.example.com/slow')).rejects.toThrow(
        'Authentication service timeout',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('OAuth API timeout: GET'),
        expect.any(String),
        'OAuthHttpClient',
      );
    });

    it('should rethrow other axios errors', async () => {
      const networkError = new Error('Network error');
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(client.get('https://api.example.com/fail')).rejects.toThrow(
        'Network error',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('OAuth HTTP error: GET'),
        expect.any(String),
        'OAuthHttpClient',
      );
    });
  });

  describe('post', () => {
    it('should perform POST request successfully', async () => {
      const responseData = { token: 'abc123' };
      mockedAxios.post.mockResolvedValue({ data: responseData });

      const postData = { code: 'auth-code' };
      const result = await client.post('https://api.example.com/token', postData);

      expect(result).toEqual(responseData);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.example.com/token',
        postData,
        expect.objectContaining({ timeout: 10000 }),
      );
    });

    it('should handle POST timeout errors', async () => {
      const timeoutError: any = new Error('Timeout');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.post.mockRejectedValue(timeoutError);

      await expect(
        client.post('https://api.example.com/slow', {}),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('OAuth API timeout: POST'),
        expect.any(String),
        'OAuthHttpClient',
      );
    });

    it('should rethrow POST errors', async () => {
      const badRequestError = new Error('Bad request');
      mockedAxios.post.mockRejectedValue(badRequestError);

      await expect(
        client.post('https://api.example.com/fail', {}),
      ).rejects.toThrow('Bad request');
    });
  });
});




