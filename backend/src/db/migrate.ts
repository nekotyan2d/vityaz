import { env } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { seed } from "./seed";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied");

await seed();

await pool.end();
