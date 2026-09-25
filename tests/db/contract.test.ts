import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";
import { databaseTypes } from "../../scripts/database-types";

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString)
  throw new Error(
    "Set TEST_DATABASE_URL to a disposable PostgreSQL test server (a separate temporary database will be created).",
  );

for (const missingView of [false, true])
  test(`database contract (${missingView ? "missing view recovery" : "existing view upgrade"})`, async (t) => {
    const admin = new pg.Client({ connectionString });
    await admin.connect();
    const database = `qna_test_${randomUUID().replaceAll("-", "")}`;
    await admin.query(`create database ${database}`);
    const url = new URL(connectionString);
    url.pathname = `/${database}`;
    const db = new pg.Client({ connectionString: url.toString() });
    await db.connect();

    async function asUser<T>(userId: string | null, operation: (client: pg.Client) => Promise<T>) {
      const client = new pg.Client({ connectionString: url.toString() });
      await client.connect();
      try {
        await client.query("begin");
        await client.query(`set local role ${userId ? "authenticated" : "anon"}`);
        await client.query("select set_config('request.jwt.claim.sub', $1, true)", [userId ?? ""]);
        const result = await operation(client);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        await client.end();
      }
    }

    const alice = randomUUID();
    const bob = randomUUID();
    try {
      // Minimal Supabase auth contract for PostgreSQL tests. Real GoTrue/PostgREST
      // behavior is exercised by deployment smoke/E2E, not simulated here.
      await db.query(`
      do $$ begin
        if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
        if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      end $$;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);
      await db.query(
        "insert into auth.users(id, email) values ($1, 'alice@example.test'), ($2, 'bob@example.test')",
        [alice, bob],
      );
      await db.query(
        await readFile(
          new URL("../../supabase/migrations/20260916000000_initial_schema.sql", import.meta.url),
          "utf8",
        ),
      );
      // Reproduce the reported production failure: base tables exist, view missing.
      await db.query("insert into public.profiles(id, username) values ($1, 'alice')", [alice]);
      const legacyQuestion = (
        await db.query(
          "insert into public.questions(user_id, title, content, category) values ($1, 'legacy', 'content', '웹개발') returning id",
          [alice],
        )
      ).rows[0].id;
      await db.query("insert into public.tags(name) values (' #migration'), ('migration')");
      await db.query(
        "insert into public.question_tags(question_id, tag_id) select $1, id from public.tags",
        [legacyQuestion],
      );
      if (missingView) await db.query("drop view public.question_feed");
      await db.query(
        await readFile(
          new URL(
            "../../supabase/migrations/20260925000000_harden_board_contract.sql",
            import.meta.url,
          ),
          "utf8",
        ),
      );

      await t.test("generated types match the migrated schema", async () => {
        const source = await databaseTypes(db);
        const path = new URL("../../types/database.types.ts", import.meta.url);
        if (process.env.UPDATE_DATABASE_TYPES === "1") await writeFile(path, source);
        assert.equal(
          await readFile(path, "utf8"),
          source,
          "Run UPDATE_DATABASE_TYPES=1 npm run test:db after reviewing schema changes.",
        );
      });

      await t.test(
        "missing view is restored and preexisting auth users are backfilled",
        async () => {
          assert.equal(
            (await db.query("select count(*)::int as count from public.profiles")).rows[0].count,
            2,
          );
          const rows = await asUser(null, (client) =>
            client.query("select * from public.question_feed"),
          );
          assert.equal(rows.rowCount, 1);
          assert.deepEqual(rows.rows[0].tags, ["migration"]);
          assert.equal(
            (
              await db.query(
                "select count(*)::int as count from public.question_tags where question_id = $1",
                [legacyQuestion],
              )
            ).rows[0].count,
            1,
          );
          await db.query("delete from public.questions where id = $1", [legacyQuestion]);
        },
      );

      const create = async (
        title = "100%_ literal, (한글)",
        tags = ["# javascript", "javascript"],
      ) =>
        (
          await asUser(alice, (client) =>
            client.query("select public.create_question_with_tags($1, $2, '웹개발', $3) as id", [
              title,
              "본문 " + "x".repeat(300),
              tags,
            ]),
          )
        ).rows[0].id as string;
      const questionId = await create();

      await t.test("owner writes and normalized tag RPC work with column grants", async () => {
        await asUser(alice, (client) =>
          client.query("select public.update_question_with_tags($1, $2, '본문', '웹개발', $3)", [
            questionId,
            "100%_ literal, (한글)",
            ["javascript", "# javascript", "##javascript", "#\u00a0#javascript"],
          ]),
        );
        const { rows } = await asUser(null, (client) =>
          client.query("select * from public.question_feed where id = $1", [questionId]),
        );
        assert.deepEqual(rows[0].tags, ["javascript"]);
        assert.equal(rows[0].status, "waiting");
      });

      await t.test("late tag failures roll back the entire question transaction", async () => {
        await db.query(
          "alter table public.tags add constraint injected_test_failure check (name <> 'z-fail')",
        );
        try {
          const before = (await db.query("select count(*)::int as count from public.questions"))
            .rows[0].count;
          await assert.rejects(create("rollback", ["a-before-failure", "z-fail"]), {
            code: "23514",
          });
          assert.equal(
            (await db.query("select count(*)::int as count from public.questions")).rows[0].count,
            before,
          );
          await assert.rejects(
            asUser(alice, (client) =>
              client.query(
                "select public.update_question_with_tags($1, 'rollback', 'content', '웹개발', $2)",
                [questionId, ["a-before-failure", "z-fail"]],
              ),
            ),
            { code: "23514" },
          );
          const result = (
            await db.query("select title, tags from public.question_feed where id = $1", [
              questionId,
            ])
          ).rows[0];
          assert.equal(result.title, "100%_ literal, (한글)");
          assert.deepEqual(result.tags, ["javascript"]);
          assert.equal(
            (await db.query("select * from public.tags where name = 'a-before-failure'")).rowCount,
            0,
          );
        } finally {
          await db.query("alter table public.tags drop constraint injected_test_failure");
        }
      });

      await t.test("RLS blocks cross-user CRUD and reports zero affected rows", async () => {
        const updated = await asUser(bob, (client) =>
          client.query("update public.questions set title = 'attack' where id = $1 returning id", [
            questionId,
          ]),
        );
        assert.equal(updated.rowCount, 0);
        const deleted = await asUser(bob, (client) =>
          client.query("delete from public.questions where id = $1 returning id", [questionId]),
        );
        assert.equal(deleted.rowCount, 0);
        await assert.rejects(
          asUser(bob, (client) =>
            client.query(
              "select public.update_question_with_tags($1, 'attack', 'text', '웹개발', '{}')",
              [questionId],
            ),
          ),
          { code: "P0002" },
        );
        await assert.rejects(
          asUser(null, (client) =>
            client.query("select public.create_question_with_tags('x', 'y', '웹개발', '{}')"),
          ),
          { code: "42501" },
        );
      });

      await t.test("system fields are protected on both insert and update", async () => {
        for (const column of ["views", "created_at", "updated_at", "user_id"]) {
          await assert.rejects(
            asUser(alice, (client) =>
              client.query(`update public.questions set ${column} = ${column} where id = $1`, [
                questionId,
              ]),
            ),
            { code: "42501" },
          );
        }
        await assert.rejects(
          asUser(alice, (client) =>
            client.query(
              "insert into public.questions(user_id, title, content, category, views) values ($1, 'x', 'y', '웹개발', 99)",
              [alice],
            ),
          ),
          { code: "42501" },
        );
        await assert.rejects(
          asUser(alice, (client) =>
            client.query(
              "insert into public.questions(user_id, title, content, category) values ($1, '   ', 'y', '웹개발')",
              [alice],
            ),
          ),
          { code: "23514" },
        );
      });

      let answerId: string;
      await t.test(
        "answers derive status, are immutable in ownership/parent, and cannot be edited by others",
        async () => {
          answerId = (
            await asUser(bob, (client) =>
              client.query(
                "insert into public.answers(question_id, user_id, content) values ($1, $2, '답변') returning id",
                [questionId, bob],
              ),
            )
          ).rows[0].id;
          assert.equal(
            (await db.query("select status from public.question_feed where id = $1", [questionId]))
              .rows[0].status,
            "answered",
          );
          for (const column of ["question_id", "user_id", "created_at", "updated_at"]) {
            await assert.rejects(
              asUser(bob, (client) =>
                client.query(`update public.answers set ${column} = ${column} where id = $1`, [
                  answerId,
                ]),
              ),
              { code: "42501" },
            );
          }
          assert.equal(
            (
              await asUser(alice, (client) =>
                client.query(
                  "update public.answers set content = 'attack' where id = $1 returning id",
                  [answerId],
                ),
              )
            ).rowCount,
            0,
          );
          assert.equal(
            (
              await asUser(bob, (client) =>
                client.query(
                  "update public.answers set content = '수정' where id = $1 returning question_id",
                  [answerId],
                ),
              )
            ).rows[0].question_id,
            questionId,
          );
        },
      );

      await t.test("simultaneous answer deletion cannot leave stale answered state", async () => {
        const second = (
          await asUser(alice, (client) =>
            client.query(
              "insert into public.answers(question_id, user_id, content) values ($1, $2, '두번째') returning id",
              [questionId, alice],
            ),
          )
        ).rows[0].id;
        await Promise.all([
          asUser(bob, (client) =>
            client.query("delete from public.answers where id = $1", [answerId]),
          ),
          asUser(alice, (client) =>
            client.query("delete from public.answers where id = $1", [second]),
          ),
        ]);
        const row = (
          await db.query("select status, answer_count from public.question_feed where id = $1", [
            questionId,
          ])
        ).rows[0];
        assert.equal(row.status, "waiting");
        assert.equal(row.answer_count, 0);
      });

      await t.test("view increments are atomic and do not modify the edit timestamp", async () => {
        const before = (
          await db.query("select views, updated_at from public.questions where id = $1", [
            questionId,
          ])
        ).rows[0];
        await Promise.all(
          Array.from({ length: 10 }, () =>
            asUser(null, (client) =>
              client.query("select public.increment_question_views($1)", [questionId]),
            ),
          ),
        );
        const after = (
          await db.query("select views, updated_at from public.questions where id = $1", [
            questionId,
          ])
        ).rows[0];
        assert.equal(Number(after.views) - Number(before.views), 10);
        assert.equal(after.updated_at.toISOString(), before.updated_at.toISOString());
      });

      await t.test(
        "invalid RPC tags roll back and direct tag inserts obey the five-tag invariant",
        async () => {
          await assert.rejects(create("invalid", ["x".repeat(31)]), { code: "22023" });
          await assert.rejects(
            asUser(alice, (client) =>
              client.query(
                "select public.update_question_with_tags($1, 'changed', 'text', '웹개발', $2)",
                [questionId, ["x".repeat(31)]],
              ),
            ),
            { code: "22023" },
          );
          assert.equal(
            (await db.query("select title from public.questions where id = $1", [questionId]))
              .rows[0].title,
            "100%_ literal, (한글)",
          );
          const cappedId = await create("tag cap", ["a", "b", "c", "d"]);
          const tagIds = (
            await asUser(alice, (client) =>
              client.query("insert into public.tags(name) values ('e'), ('f') returning id"),
            )
          ).rows;
          const results = await Promise.allSettled(
            tagIds.map(({ id }) =>
              asUser(alice, (client) =>
                client.query(
                  "insert into public.question_tags(question_id, tag_id) values ($1, $2)",
                  [cappedId, id],
                ),
              ),
            ),
          );
          assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
          assert.equal(
            (
              await db.query(
                "select count(*)::int as count from public.question_tags where question_id = $1",
                [cappedId],
              )
            ).rows[0].count,
            5,
          );
        },
      );

      await t.test("parameterized search treats punctuation as literal text", async () => {
        await create("100ZZ wildcard decoy", []);
        for (const search of ["%_", "literal, (한글)"]) {
          const result = await asUser(null, (client) =>
            client.query("select * from public.search_questions($1)", [search]),
          );
          assert.deepEqual(
            result.rows.map((row) => row.id),
            [questionId],
          );
        }
        await assert.rejects(
          asUser(null, (client) =>
            client.query("select * from public.search_questions(page_size => 100000)"),
          ),
          { code: "22023" },
        );
      });

      await t.test("pagination covers more than 50 rows with deterministic ties", async () => {
        await db.query(
          "insert into public.questions(user_id, title, content, category) select $1, 'paged ' || i, 'body', '웹개발' from generate_series(1, 55) i",
          [alice],
        );
        const ids: string[] = [];
        for (let page = 1; page <= 3; page++) {
          const result = await asUser(null, (client) =>
            client.query(
              "select * from public.search_questions('paged', null, null, 'views', $1, 20)",
              [page],
            ),
          );
          if (page < 3) assert.equal(result.rows.length, 21);
          ids.push(...result.rows.slice(0, 20).map((row) => row.id));
        }
        assert.equal(ids.length, 55);
        assert.equal(new Set(ids).size, 55);
      });
    } finally {
      await db.end();
      await admin.query(`drop database ${database} with (force)`);
      await admin.end();
    }
  });
