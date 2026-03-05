/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/test'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/index.ts',
    '!src/**/*.d.ts',
    '!src/standalone.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@dto/(.*)$': '<rootDir>/src/dto/$1',
    '^@repos/(.*)$': '<rootDir>/src/repositories/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@guards/(.*)$': '<rootDir>/src/guards/$1',
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@filters/(.*)$': '<rootDir>/src/filters/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
