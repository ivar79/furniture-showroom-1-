import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // زمان اتصال را برای دیتابیس‌های ابری مثل نئون کمی بیشتر می‌کنیم
    });

    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}