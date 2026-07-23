export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          closes_at: string
          created_at: string
          created_by: string | null
          geofence_radius_m: number | null
          id: string
          is_backfilled: boolean
          keyword: string
          link_token: string
          location_lat: number | null
          location_lng: number | null
          opens_at: string
          scheduled_date: string
          status: Database["public"]["Enums"]["activity_status"]
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          closes_at: string
          created_at?: string
          created_by?: string | null
          geofence_radius_m?: number | null
          id?: string
          is_backfilled?: boolean
          keyword: string
          link_token?: string
          location_lat?: number | null
          location_lng?: number | null
          opens_at: string
          scheduled_date: string
          status?: Database["public"]["Enums"]["activity_status"]
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          closes_at?: string
          created_at?: string
          created_by?: string | null
          geofence_radius_m?: number | null
          id?: string
          is_backfilled?: boolean
          keyword?: string
          link_token?: string
          location_lat?: number | null
          location_lng?: number | null
          opens_at?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["activity_status"]
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acting_user_id: string | null
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          reason: string | null
        }
        Insert: {
          acting_user_id?: string | null
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          reason?: string | null
        }
        Update: {
          acting_user_id?: string | null
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_acting_user_id_fkey"
            columns: ["acting_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          anniversary_date: string | null
          birthday: string | null
          created_at: string
          created_by: string | null
          gender: string | null
          id: string
          join_date: string
          name: string
          phone_number: string | null
          photo_url: string | null
          status_manual:
            | Database["public"]["Enums"]["member_status_manual"]
            | null
          updated_at: string
        }
        Insert: {
          anniversary_date?: string | null
          birthday?: string | null
          created_at?: string
          created_by?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          name: string
          phone_number?: string | null
          photo_url?: string | null
          status_manual?:
            | Database["public"]["Enums"]["member_status_manual"]
            | null
          updated_at?: string
        }
        Update: {
          anniversary_date?: string | null
          birthday?: string | null
          created_at?: string
          created_by?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          name?: string
          phone_number?: string | null
          photo_url?: string | null
          status_manual?:
            | Database["public"]["Enums"]["member_status_manual"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          activity_id: string
          geofence_outcome:
            | Database["public"]["Enums"]["geofence_outcome"]
            | null
          id: string
          member_id: string
          response_payload: Json | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
        }
        Insert: {
          activity_id: string
          geofence_outcome?:
            | Database["public"]["Enums"]["geofence_outcome"]
            | null
          id?: string
          member_id: string
          response_payload?: Json | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
        }
        Update: {
          activity_id?: string
          geofence_outcome?:
            | Database["public"]["Enums"]["geofence_outcome"]
            | null
          id?: string
          member_id?: string
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_activity: {
        Args: { p_activity_id: string; p_reason?: string }
        Returns: undefined
      }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_checkin_activity: {
        Args: { p_link_token: string }
        Returns: {
          closes_at: string
          id: string
          opens_at: string
          scheduled_date: string
          status: Database["public"]["Enums"]["activity_status"]
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }[]
      }
      list_checkin_members: {
        Args: { p_link_token: string }
        Returns: {
          id: string
          join_date: string
          name: string
        }[]
      }
      reopen_activity: {
        Args: { p_activity_id: string; p_reason?: string }
        Returns: {
          outcome: string
        }[]
      }
      submit_checkin: {
        Args: {
          p_keyword: string
          p_lat?: number
          p_link_token: string
          p_lng?: number
          p_member_id: string
        }
        Returns: {
          geofence_outcome: Database["public"]["Enums"]["geofence_outcome"]
          outcome: string
          submission_status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
        }[]
      }
      sync_activity_statuses: { Args: never; Returns: undefined }
    }
    Enums: {
      activity_status: "scheduled" | "open" | "closed"
      activity_type: "attendance" | "message_review"
      app_role:
        | "administrative_officer"
        | "head_of_department"
        | "assistant_head_of_department"
        | "minister_in_charge"
      geofence_outcome: "match" | "mismatch" | "unknown"
      member_status_manual: "active" | "transferred" | "inactive"
      submission_status: "present" | "absent" | "excused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_status: ["scheduled", "open", "closed"],
      activity_type: ["attendance", "message_review"],
      app_role: [
        "administrative_officer",
        "head_of_department",
        "assistant_head_of_department",
        "minister_in_charge",
      ],
      geofence_outcome: ["match", "mismatch", "unknown"],
      member_status_manual: ["active", "transferred", "inactive"],
      submission_status: ["present", "absent", "excused"],
    },
  },
} as const
