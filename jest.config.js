const { transformIgnorePatterns } = require('jest-expo/jest-preset');

// Packages that ship untranspiled JSX and must go through Babel like Expo's own modules.
const transpiledPackages = ['@rn-primitives'];

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  transformIgnorePatterns: transformIgnorePatterns.map((pattern) =>
    pattern.replace('(?!(', `(?!(${transpiledPackages.join('|')}|`)
  ),
};
