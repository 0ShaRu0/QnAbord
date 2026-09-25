export const EDITABLE_CATEGORIES = ["프로그래밍", "웹개발", "디자인", "기타"] as const;
export type QuestionCategory = (typeof EDITABLE_CATEGORIES)[number];
export const LIMITS = { title: 120, content: 10000, tags: 5, tag: 30, search: 200 } as const;

export type ValidationResult<T> =
  { ok: true; value: T } | { ok: false; fieldErrors: Record<string, string> };

export function stringField(form: FormData, name: string): string | null {
  const value = form.get(name);
  return typeof value === "string" ? value : null;
}

// PostgreSQL char_length counts Unicode code points, not UTF-16 code units.
export function textLength(value: string) {
  return Array.from(value).length;
}

export function isQuestionCategory(value: string): value is QuestionCategory {
  return EDITABLE_CATEGORIES.some((category) => category === value);
}

export function normalizeTags(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim().replace(/^[#\s]+/u, ""))
        .filter(Boolean),
    ),
  ];
}

export function parseQuestion(form: FormData) {
  const title = stringField(form, "title")?.trim() ?? "";
  const content = stringField(form, "content")?.trim() ?? "";
  const category = stringField(form, "category") ?? "";
  const rawTags = stringField(form, "tags");
  const tags = normalizeTags(rawTags ?? "");
  const fieldErrors: Record<string, string> = {};
  if (rawTags?.split(",").some((tag) => textLength(tag) > 1024)) {
    fieldErrors.tags = "태그 입력이 너무 깁니다.";
  }

  if (!title || textLength(title) > LIMITS.title)
    fieldErrors.title = "제목은 1~120자로 입력해주세요.";
  if (!content || textLength(content) > LIMITS.content)
    fieldErrors.content = "내용은 1~10,000자로 입력해주세요.";
  if (!isQuestionCategory(category)) fieldErrors.category = "올바른 카테고리를 선택해주세요.";
  if (rawTags === null && form.has("tags")) fieldErrors.tags = "태그를 문자열로 입력해주세요.";
  if (tags.length > LIMITS.tags || tags.some((tag) => textLength(tag) > LIMITS.tag)) {
    fieldErrors.tags = "태그는 최대 5개, 각각 30자 이하로 입력해주세요.";
  }
  if (Object.keys(fieldErrors).length || !isQuestionCategory(category)) {
    return { ok: false as const, fieldErrors };
  }
  return { ok: true as const, value: { title, content, category, tags } };
}

export function parseAnswer(form: FormData): ValidationResult<{ content: string }> {
  const content = stringField(form, "content")?.trim() ?? "";
  if (!content || textLength(content) > LIMITS.content) {
    return { ok: false, fieldErrors: { content: "답변은 1~10,000자로 입력해주세요." } };
  }
  return { ok: true, value: { content } };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
