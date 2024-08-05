export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          limit: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          limit: number
          title: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          limit?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locales: {
        Row: {
          code: string
          name: string
          native_name: string
          translations: Json
          updated_at: string | null
        }
        Insert: {
          code: string
          name: string
          native_name: string
          translations?: Json
          updated_at?: string | null
        }
        Update: {
          code?: string
          name?: string
          native_name?: string
          translations?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          bill: number
          bio: string
          birthday_date: string | null
          currency: string
          first_name: string
          gender: Database["public"]["Enums"]["user_gender"]
          id: string
          last_name: string
          locale: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string
          bill?: number
          bio?: string
          birthday_date?: string | null
          currency?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["user_gender"]
          id: string
          last_name?: string
          locale?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string
          bill?: number
          bio?: string
          birthday_date?: string | null
          currency?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["user_gender"]
          id?: string
          last_name?: string
          locale?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
        ]
      }
      record_details: {
        Row: {
          created_at: string
          fullname: string
          fullpath: string
          id: string
          record_id: string
          size: number
        }
        Insert: {
          created_at?: string
          fullname?: string
          fullpath: string
          id: string
          record_id: string
          size: number
        }
        Update: {
          created_at?: string
          fullname?: string
          fullpath?: string
          id?: string
          record_id?: string
          size?: number
        }
        Relationships: [
          {
            foreignKeyName: "record_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "objects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_details_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      records: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          description: string
          id: string
          type: Database["public"]["Enums"]["record_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          description?: string
          id?: string
          type: Database["public"]["Enums"]["record_type"]
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          type?: Database["public"]["Enums"]["record_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "records_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_category_spend_for_auth_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          limit: number
          spend: number
          percent: number
          created_at: string
          updated_at: string
        }[]
      }
      change_user_password: {
        Args: {
          current_password: string
          new_password: string
        }
        Returns: Json
      }
      get_record_types: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["record_type"][][]
      }
      get_user_genders: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_gender"][][]
      }
    }
    Enums: {
      record_type: "income" | "outcome"
      user_gender: "male" | "female" | "unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

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
    : never
