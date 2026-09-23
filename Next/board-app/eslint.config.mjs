import nextConfig from 'eslint-config-next';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = [
  // 1. Configurações base do Next.js
  ...nextConfig,

  // 2. Integração com Prettier (desativa regras conflitantes e roda o prettier como regra eslint)
  eslintPluginPrettierRecommended,

  // 3. Ignorar pastas e builds
  {
    ignores: [
      'src/generated/prisma/**',
      'src/app/generated/prisma/**',
      'pgdata/**',
      '.next/**',
      'node_modules/**',
    ],
  },

  // 4. Regras customizadas
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'prettier/prettier': 'error', // Garante que desvios de formatação apontem como erro no linter
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
];

export default eslintConfig;
