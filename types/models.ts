import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type QuestionFeedRow = Database["public"]["Views"]["question_feed"]["Row"];
export type QuestionListItem = Database["public"]["Tables"]["questions"]["Row"] & {
  status: Database["public"]["Enums"]["question_status"];
  username: string;
  avatar_url: string | null;
  answer_count: number;
  tags: string[];
};
export type PopularQuestion = Pick<QuestionListItem, "id" | "title" | "views" | "answer_count">;
export type QuestionDraft = Pick<
  QuestionListItem,
  "id" | "title" | "content" | "category" | "tags"
>;
export type AnswerWithAuthor = Database["public"]["Tables"]["answers"]["Row"] & {
  profiles: Pick<Profile, "username" | "avatar_url"> | null;
};
export type PageResult<T> = { items: T[]; page: number; hasMore: boolean };
