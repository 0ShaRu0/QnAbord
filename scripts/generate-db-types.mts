import { writeFile } from "node:fs/promises";
import pg from "pg";
import { databaseTypes } from "./database-types";

if (!process.env.TYPEGEN_DATABASE_URL)
  throw new Error("Set TYPEGEN_DATABASE_URL to the migrated database.");
const client = new pg.Client({ connectionString: process.env.TYPEGEN_DATABASE_URL });
try {
  await client.connect();
  const source = await databaseTypes(client);
  await writeFile(new URL("../types/database.types.ts", import.meta.url), source);
  console.log("Database types generated.");
} finally {
  await client.end();
}
