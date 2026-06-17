import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    const host = process.env.SQL_HOST;
    const database = process.env.SQL_DB_NAME;
    const user = process.env.SQL_ADMIN_USER;
    const password = process.env.SQL_ADMIN_PASSWORD;

    if (!host || !database || !user || !password) {
      throw new Error("Database configuration environment variables are missing.");
    }

    const pool = new Pool({
      host,
      database,
      user,
      password,
      port: 5432,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}
