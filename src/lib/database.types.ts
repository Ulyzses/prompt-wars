export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      attacks: {
        Row: {
          atk_prompt: string | null;
          attacker: number | null;
          created_at: string;
          def_prompt: string | null;
          defender: number | null;
          id: number;
          response: string | null;
          round: number;
          session: number | null;
        };
        Insert: {
          atk_prompt?: string | null;
          attacker?: number | null;
          created_at?: string;
          def_prompt?: string | null;
          defender?: number | null;
          id?: number;
          response?: string | null;
          round: number;
          session?: number | null;
        };
        Update: {
          atk_prompt?: string | null;
          attacker?: number | null;
          created_at?: string;
          def_prompt?: string | null;
          defender?: number | null;
          id?: number;
          response?: string | null;
          round?: number;
          session?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "attacks_attacker_fkey";
            columns: ["attacker"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attacks_defender_fkey";
            columns: ["defender"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attacks_session_fkey";
            columns: ["session"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      breaks: {
        Row: {
          attacker: number | null;
          created_at: string;
          defender: number | null;
          id: number;
          password: string | null;
          round: number | null;
          score_change: number;
          session: number | null;
        };
        Insert: {
          attacker?: number | null;
          created_at?: string;
          defender?: number | null;
          id?: number;
          password?: string | null;
          round?: number | null;
          score_change?: number;
          session?: number | null;
        };
        Update: {
          attacker?: number | null;
          created_at?: string;
          defender?: number | null;
          id?: number;
          password?: string | null;
          round?: number | null;
          score_change?: number;
          session?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "breaks_attacker_fkey";
            columns: ["attacker"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "breaks_defender_fkey";
            columns: ["defender"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "breaks_session_fkey";
            columns: ["session"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          created_at: string;
          def_prompt: string;
          id: number;
          name: string;
          password: string;
          score: number;
          session: number | null;
        };
        Insert: {
          created_at?: string;
          def_prompt?: string;
          id?: number;
          name: string;
          password?: string;
          score?: number;
          session?: number | null;
        };
        Update: {
          created_at?: string;
          def_prompt?: string;
          id?: number;
          name?: string;
          password?: string;
          score?: number;
          session?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_session_fkey";
            columns: ["session"];
            isOneToOne: false;
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          created_at: string;
          id: number;
          max_rounds: number;
          name: string;
          round: number;
          state: Database["public"]["Enums"]["GameState"];
        };
        Insert: {
          created_at?: string;
          id?: number;
          max_rounds?: number;
          name?: string;
          round?: number;
          state?: Database["public"]["Enums"]["GameState"];
        };
        Update: {
          created_at?: string;
          id?: number;
          max_rounds?: number;
          name?: string;
          round?: number;
          state?: Database["public"]["Enums"]["GameState"];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_score: {
        Args: {
          val: number;
          player_id: number;
        };
        Returns: number;
      };
    };
    Enums: {
      GameState: "WAITING" | "DEFENDING" | "ATTACKING" | "CONCLUDED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
