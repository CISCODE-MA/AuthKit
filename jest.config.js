/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/index.ts',
    '!**/*.d.ts',
    '!**/standalone.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@entities/(.*)$': '<rootDir>/entities/$1',
    '^@dto/(.*)$': '<rootDir>/dto/$1',
    '^@repos/(.*)$': '<rootDir>/repositories/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@guards/(.*)$': '<rootDir>/guards/$1',
    '^@decorators/(.*)$': '<rootDir>/decorators/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@filters/(.*)$': '<rootDir>/filters/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
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
