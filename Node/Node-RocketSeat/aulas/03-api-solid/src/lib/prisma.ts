import 'dotenv/config';
import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from '@/env/index.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'dev' ? ['query'] : [], 
    adapter
 });
