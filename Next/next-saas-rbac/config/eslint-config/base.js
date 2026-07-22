// packages/eslint-config/base.js
import antfu from '@antfu/eslint-config'
import turboPlugin from 'eslint-plugin-turbo'

/**
 * A shared ESLint configuration for the repository.
 */
export const config = antfu(
  {
    typescript: true,
    formatters: true, // formata css/html/md também, opcional
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    ignores: ['dist/**'],
  },
)