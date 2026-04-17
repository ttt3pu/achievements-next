// ref: https://nextjs.org/docs/app/api-reference/config/eslint
import { fixupPluginRules } from '@eslint/compat';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tsEslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tsEslint.config(
  {
    ignores: ['next-env.d.ts', '.next/**', 'node_modules/**'],
  },
  {
    ...reactPlugin.configs.flat.recommended,
    plugins: { react: fixupPluginRules(reactPlugin) },
  },
  {
    ...reactPlugin.configs.flat['jsx-runtime'],
    plugins: { react: fixupPluginRules(reactPlugin) },
  },
  {
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  nextPlugin.flatConfig.coreWebVitals,
  ...tsEslint.configs.recommended,
  prettierConfig,
  {
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/prop-types': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: false,
          allowTernary: false,
          allowTaggedTemplates: false,
        },
      ],
    },
  },
);
