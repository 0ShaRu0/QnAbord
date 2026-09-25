import { introspect, generateTypescript, sortGeneratorMetadata } from "@supabase/postgrest-typegen";
import { format } from "prettier";
import type pg from "pg";

export async function databaseTypes(client: pg.Client) {
  // Introspection issues parallel queries. Serialize on a single Client (pg 9
  // will no longer queue them implicitly).
  let pending: Promise<unknown> = Promise.resolve();
  const queryable = {
    query(sql: string) {
      const result = pending.then(() => client.query(sql));
      pending = result;
      return result;
    },
  };
  const metadata = sortGeneratorMetadata(
    await introspect(queryable, { includedSchemas: ["public"] }),
  );
  const extensions = await client.query<{ id: number }>(
    "select objid::int as id from pg_depend where classid = 'pg_proc'::regclass and deptype = 'e'",
  );
  const extensionIds = new Set(extensions.rows.map((row) => row.id));
  metadata.functions = metadata.functions.filter((fn) => !extensionIds.has(fn.id));
  const source = await generateTypescript(metadata, { detectOneToOneRelationships: true });
  return format(
    `// Generated from the migrated database. Run npm run types:db; do not edit.\n${source}`,
    {
      parser: "typescript",
      printWidth: 100,
      trailingComma: "all",
    },
  );
}
