import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Use Neon driver for production (Replit), regular pg for local development
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.DATABASE_URL.includes("neon.tech");

let pool: any;
let db: any;

if (isProduction) {
  // Neon serverless (WebSocket-based) for production
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Standard PostgreSQL driver for local development
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg({ client: pool, schema });
}

export { pool, db };
