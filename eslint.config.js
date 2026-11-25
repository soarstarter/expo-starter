const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      '.agents/*',
      '.claude/*',
      'components/ui/*',
      'web-build/*',
      'ios/*',
      'android/*',
      '*.config.js',
    ],
  },
];
