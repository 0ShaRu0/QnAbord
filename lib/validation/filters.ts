import { isQuestionCategory, LIMITS, type QuestionCategory } from "./questions";

export type RawSearchParams = Record<string, string | string[] | undefined>;
export type QuestionFilters = {
  query: string;
  category?: QuestionCategory;
  status?: "waiting" | "answered";
  sort: "latest" | "views" | "answers";
  page: number;
};
export const PAGE_SIZE = 20;
export const DEFAULT_FILTERS: QuestionFilters = { query: "", sort: "latest", page: 1 };

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFilters(params: RawSearchParams = {}): QuestionFilters {
  const category = firstParam(params.category) ?? "";
  const status = firstParam(params.status);
  const sort = firstParam(params.sort);
  const page = Number(firstParam(params.page));
  return {
    query: Array.from(firstParam(params.query)?.trim() ?? "")
      .slice(0, LIMITS.search)
      .join(""),
    category: isQuestionCategory(category) ? category : undefined,
    status: status === "waiting" || status === "answered" ? status : undefined,
    sort: sort === "views" || sort === "answers" ? sort : "latest",
    page: Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : 1,
  };
}

export function questionListUrl(filters: QuestionFilters, changes: Partial<QuestionFilters> = {}) {
  const next = { ...filters, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.query) params.set("query", next.query);
  if (next.category) params.set("category", next.category);
  if (next.status) params.set("status", next.status);
  if (next.sort !== "latest") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return `/questions${query ? `?${query}` : ""}`;
}
