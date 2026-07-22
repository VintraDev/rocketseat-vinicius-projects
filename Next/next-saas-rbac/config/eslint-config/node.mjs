// packages/eslint-config/node.js
import antfu from '@antfu/eslint-config'
import turboPlugin from 'eslint-plugin-turbo'

export const nodeConfig = antfu(
  {
    typescript: true,
    formatters: true,
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
)