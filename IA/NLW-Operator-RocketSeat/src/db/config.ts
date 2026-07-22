import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "devroast",
  user: process.env.DB_USER || "devroast_user",
  password: process.env.DB_PASSWORD || "devroast_password",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Configuração do Drizzle com casing personalizado
export const db = drizzle(pool, {
  schema,
  casing: "snake_case", // Isso converte automaticamente camelCase para snake_case no banco
});

export type Database = typeof db;

// Utility para logs em desenvolvimento
if (
  process.env.NODE_ENV === "development" &&
  process.env.ENABLE_QUERY_LOGGING === "true"
) {
  // Pool events for debugging
  pool.on("connect", () => {
    console.log("🔗 Connected to PostgreSQL database");
  });

  pool.on("error", (err) => {
    console.error("❌ PostgreSQL connection error:", err);
  });
}

// Graceful shutdown
process.on("SIGINT", () => {
  pool.end(() => {
    console.log("🔌 PostgreSQL pool disconnected");
    process.exit(0);
  });
});
