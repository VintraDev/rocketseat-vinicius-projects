import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'src/generated/prisma/**',
      'src/app/generated/prisma/**',
      'pgdata/**',
      '.next/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
];

export default eslintConfig;
