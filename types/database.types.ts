// Generated from the migrated database. Run npm run types:db; do not edit.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      answers: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          question_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          question_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          question_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_feed";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          username?: string;
        };
        Relationships: [];
      };
      question_tags: {
        Row: {
          question_id: string;
          tag_id: number;
        };
        Insert: {
          question_id: string;
          tag_id: number;
        };
        Update: {
          question_id?: string;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "question_feed";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_tags_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          category: Database["public"]["Enums"]["question_category"];
          content: string;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
          views: number;
        };
        Insert: {
          category: Database["public"]["Enums"]["question_category"];
          content: string;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          views?: number;
        };
        Update: {
          category?: Database["public"]["Enums"]["question_category"];
          content?: string;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      question_feed: {
        Row: {
          answer_count: number | null;
          avatar_url: string | null;
          category: Database["public"]["Enums"]["question_category"] | null;
          content: string | null;
          created_at: string | null;
          id: string | null;
          status: Database["public"]["Enums"]["question_status"] | null;
          tags: Json | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
          username: string | null;
          views: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "questions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      create_question_with_tags: {
        Args: {
          question_category: string;
          question_content: string;
          question_title: string;
          tag_names: string[];
        };
        Returns: string;
      };
      increment_question_views: {
        Args: { question_id: string };
        Returns: number;
      };
      normalize_question_tags: {
        Args: { tag_names: string[] };
        Returns: string[];
      };
      normalize_tag: { Args: { value: string }; Returns: string };
      search_questions: {
        Args: {
          category_filter?: Database["public"]["Enums"]["question_category"];
          page_number?: number;
          page_size?: number;
          search_text?: string;
          sort_by?: string;
          status_filter?: Database["public"]["Enums"]["question_status"];
        };
        Returns: {
          answer_count: number | null;
          avatar_url: string | null;
          category: Database["public"]["Enums"]["question_category"] | null;
          content: string | null;
          created_at: string | null;
          id: string | null;
          status: Database["public"]["Enums"]["question_status"] | null;
          tags: Json | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
          username: string | null;
          views: number | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "question_feed";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      trim_input: { Args: { value: string }; Returns: string };
      update_question_with_tags: {
        Args: {
          question_category: string;
          question_content: string;
          question_id: string;
          question_title: string;
          tag_names: string[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      question_category: "프로그래밍" | "웹개발" | "디자인" | "기타";
      question_status: "waiting" | "answered";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      question_category: ["프로그래밍", "웹개발", "디자인", "기타"],
      question_status: ["waiting", "answered"],
    },
  },
} as const;
