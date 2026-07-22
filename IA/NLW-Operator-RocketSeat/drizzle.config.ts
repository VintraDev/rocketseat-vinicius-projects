import { loadEnvConfig } from "@next/env";
import type { Config } from "drizzle-kit";

// Carregar variáveis de ambiente
loadEnvConfig(process.cwd());

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: (() => {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL is required for drizzle-kit");
      }
      return databaseUrl;
    })(),
  },
  // Configurações adicionais
  verbose: true,
  strict: true,
  // Casing config - converte automaticamente camelCase para snake_case
  casing: "snake_case",
} satisfies Config;
