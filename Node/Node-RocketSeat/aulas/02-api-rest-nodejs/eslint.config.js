import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules/**', 'build/**', 'db/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  }
];
