// packages/eslint-config/next.js
import antfu from '@antfu/eslint-config'
import turboPlugin from 'eslint-plugin-turbo'

export const nextConfig = antfu(
  {
    typescript: true,
    react: true,
    formatters: true,
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
    ignores: ['dist/**', '.next/**'],
  },
)