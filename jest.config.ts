import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  clearMocks: true,
  testMatch: [
    "<rootDir>/test/**/*.spec.ts",
    "<rootDir>/test/**/*.test.ts",
    "<rootDir>/src/**/*.spec.ts",
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@auth/(.*)$": "<rootDir>/src/auth/$1",
    "^@users/(.*)$": "<rootDir>/src/users/$1",
    "^@roles/(.*)$": "<rootDir>/src/roles/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@providers/(.*)$": "<rootDir>/src/providers/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/index.ts"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

export default config;
