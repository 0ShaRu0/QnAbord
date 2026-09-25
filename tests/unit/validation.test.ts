import assert from "node:assert/strict";
import test from "node:test";
import { getSafeRedirect } from "../../lib/auth/redirect";
import { parseFilters, questionListUrl } from "../../lib/validation/filters";
import { isUuid, normalizeTags, parseAnswer, parseQuestion } from "../../lib/validation/questions";
import { formatRelativeTime } from "../../lib/utils";

function question(overrides: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    title: "질문",
    content: "내용",
    category: "웹개발",
    tags: "",
    ...overrides,
  }))
    form.set(key, value);
  return form;
}

test("redirects remain local after URL normalization", () => {
  for (const input of [
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "https://evil.example",
    null,
    ["/safe"],
    "/path\r\nLocation: x",
    "/folder/..//evil.example",
    "/folder/%2e%2e//evil.example",
  ]) {
    assert.equal(getSafeRedirect(input), "/");
  }
  assert.equal(
    getSafeRedirect("/questions/../login?next=%2Fquestions#form"),
    "/login?next=%2Fquestions#form",
  );
  assert.equal(getSafeRedirect("/questions?query=한글"), "/questions?query=%ED%95%9C%EA%B8%80");
});

test("filters normalize array parameters and reject invalid enums and pagination", () => {
  assert.deepEqual(
    parseFilters({
      query: ["  한글  ", "ignored"],
      category: "invalid",
      status: "invalid",
      sort: "invalid",
      page: "-1",
    }),
    { query: "한글", category: undefined, status: undefined, sort: "latest", page: 1 },
  );
  assert.equal(parseFilters({ page: "Infinity" }).page, 1);
  assert.equal(parseFilters({ page: "1.5" }).page, 1);
  assert.equal(parseFilters({ query: "😀".repeat(201) }).query, "😀".repeat(200));
});

test("filter links preserve independent filters and reset pagination", () => {
  const filters = parseFilters({
    query: "a&b",
    category: "웹개발",
    status: "waiting",
    sort: "views",
    page: "3",
  });
  const url = new URL(questionListUrl(filters, { status: "answered" }), "https://app.example");
  assert.equal(url.searchParams.get("query"), "a&b");
  assert.equal(url.searchParams.get("category"), "웹개발");
  assert.equal(url.searchParams.get("sort"), "views");
  assert.equal(url.searchParams.get("status"), "answered");
  assert.equal(url.searchParams.has("page"), false);
  assert.equal(new URL(questionListUrl(filters, { page: 4 }), url).searchParams.get("page"), "4");
});

test("tags normalize hash/whitespace before deduplication without silent truncation", () => {
  assert.deepEqual(normalizeTags("##tag, # #tag, #\u00a0#tag, C#"), ["tag", "C#"]);
  assert.deepEqual(normalizeTags(" # javascript, javascript, #한글, ,\u00a0react\u00a0"), [
    "javascript",
    "한글",
    "react",
  ]);
  assert.equal(parseQuestion(question({ tags: "a,b,c,d,e,f" })).ok, false);
  assert.equal(parseQuestion(question({ tags: "a".repeat(31) })).ok, false);
  assert.equal(parseQuestion(question({ tags: "😀".repeat(30) })).ok, true);
});

test("form parsers reject blank text, files, and invalid categories", () => {
  assert.equal(parseQuestion(question({ title: " \n\t", category: "전체" })).ok, false);
  const form = question();
  form.set("title", new Blob(["file"]), "title.txt");
  assert.equal(parseQuestion(form).ok, false);
  form.set("content", " ");
  assert.equal(parseAnswer(form).ok, false);
  assert.equal(parseQuestion(question({ title: "😀".repeat(120) })).ok, true);
  assert.equal(parseQuestion(question({ content: "a".repeat(10001) })).ok, false);
});

test("UUIDs and dates have deliberate invalid-input handling", () => {
  assert.equal(isUuid("not-an-id"), false);
  assert.equal(isUuid("123e4567-e89b-12d3-a456-426614174000"), true);
  assert.equal(formatRelativeTime("invalid"), "날짜 미상");
  const now = Date.parse("2026-09-25T00:00:00Z");
  assert.equal(formatRelativeTime("2026-09-24T23:59:00Z", now), "1분 전");
  assert.notEqual(formatRelativeTime("2026-09-26T00:00:00Z", now), "방금 전");
});
