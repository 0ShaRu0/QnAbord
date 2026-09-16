export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; avatar_url: string | null; created_at: string };
        Insert: { id: string; username: string; avatar_url?: string | null; created_at?: string };
        Update: { username?: string; avatar_url?: string | null };
        Relationships: [];
      };
      questions: {
        Row: { id: string; user_id: string; title: string; content: string; category: string; status: "waiting" | "answered"; views: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; title: string; content: string; category: string; status?: "waiting" | "answered"; views?: number; created_at?: string; updated_at?: string };
        Update: { title?: string; content?: string; category?: string; status?: "waiting" | "answered"; updated_at?: string };
        Relationships: [{ foreignKeyName: "questions_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      answers: {
        Row: { id: string; question_id: string; user_id: string; content: string; created_at: string; updated_at: string };
        Insert: { id?: string; question_id: string; user_id: string; content: string; created_at?: string; updated_at?: string };
        Update: { content?: string; updated_at?: string };
        Relationships: [
          { foreignKeyName: "answers_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "questions"; referencedColumns: ["id"] },
          { foreignKeyName: "answers_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      tags: {
        Row: { id: number; name: string };
        Insert: { id?: number; name: string };
        Update: { name?: string };
        Relationships: [];
      };
      question_tags: {
        Row: { question_id: string; tag_id: number };
        Insert: { question_id: string; tag_id: number };
        Update: never;
        Relationships: [
          { foreignKeyName: "question_tags_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "questions"; referencedColumns: ["id"] },
          { foreignKeyName: "question_tags_tag_id_fkey"; columns: ["tag_id"]; isOneToOne: false; referencedRelation: "tags"; referencedColumns: ["id"] }
        ];
      };
    };
    Views: {
      question_feed: {
        Row: { id: string; user_id: string; title: string; content: string; category: string; status: "waiting" | "answered"; views: number; created_at: string; updated_at: string; username: string; avatar_url: string | null; answer_count: number; tags: Json };
        Relationships: [];
      };
    };
    Functions: {
      increment_question_views: { Args: { question_id: string }; Returns: number };
      create_question_with_tags: { Args: { question_title: string; question_content: string; question_category: string; tag_names: string[] }; Returns: string };
      update_question_with_tags: { Args: { question_id: string; question_title: string; question_content: string; question_category: string; tag_names: string[] }; Returns: undefined };
    };
    Enums: { question_status: "waiting" | "answered"; question_category: "프로그래밍" | "웹개발" | "디자인" | "기타" };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Answer = Database["public"]["Tables"]["answers"]["Row"];

export type QuestionListItem = Question & {
  username: string;
  avatar_url: string | null;
  answer_count: number;
  tags: string[];
};

export type AnswerWithAuthor = Answer & {
  profiles: Pick<Profile, "username" | "avatar_url"> | null;
};

export type QuestionDetailData = QuestionListItem & {
  answers: AnswerWithAuthor[];
};
