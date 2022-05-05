module.exports = {
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
  ],
  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'max-len': ['error', { 'code': 120, ignoreStrings: true }],
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'comma-dangle': ['error', 'always-multiline'],
  },
};
