export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
          keyword_no_location: string | null
          link_token: string
          location_lat: number | null
          location_lng: number | null
          opens_at: string
          scheduled_date: string
          service_template_id: string | null
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
          keyword_no_location?: string | null
          link_token?: string
          location_lat?: number | null
          location_lng?: number | null
          opens_at: string
          scheduled_date: string
          service_template_id?: string | null
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
          keyword_no_location?: string | null
          link_token?: string
          location_lat?: number | null
          location_lng?: number | null
          opens_at?: string
          scheduled_date?: string
          service_template_id?: string | null
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
          {
            foreignKeyName: "activities_service_template_id_fkey"
            columns: ["service_template_id"]
            isOneToOne: false
            referencedRelation: "service_templates"
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
      follow_up_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignee_name: string
          assignee_phone: string | null
          completed_at: string | null
          feedback_note: string | null
          id: string
          member_id: string
          status: string
          token: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignee_name: string
          assignee_phone?: string | null
          completed_at?: string | null
          feedback_note?: string | null
          id?: string
          member_id: string
          status?: string
          token?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignee_name?: string
          assignee_phone?: string | null
          completed_at?: string | null
          feedback_note?: string | null
          id?: string
          member_id?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_registration_requests: {
        Row: {
          anniversary_date: string | null
          birthday: string | null
          gender: string | null
          id: string
          join_reason: string | null
          marital_status: string | null
          name: string
          occupation: string | null
          phone_number: string | null
          registration_link_id: string | null
          residential_address: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          anniversary_date?: string | null
          birthday?: string | null
          gender?: string | null
          id?: string
          join_reason?: string | null
          marital_status?: string | null
          name: string
          occupation?: string | null
          phone_number?: string | null
          registration_link_id?: string | null
          residential_address?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          anniversary_date?: string | null
          birthday?: string | null
          gender?: string | null
          id?: string
          join_reason?: string | null
          marital_status?: string | null
          name?: string
          occupation?: string | null
          phone_number?: string | null
          registration_link_id?: string | null
          residential_address?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_registration_requests_registration_link_id_fkey"
            columns: ["registration_link_id"]
            isOneToOne: false
            referencedRelation: "registration_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_registration_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
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
          join_reason: string | null
          marital_status: string | null
          name: string
          occupation: string | null
          phone_number: string | null
          photo_url: string | null
          residential_address: string | null
          status_manual:
            | Database["public"]["Enums"]["member_status_manual"]
            | null
          status_reason: string | null
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
          join_reason?: string | null
          marital_status?: string | null
          name: string
          occupation?: string | null
          phone_number?: string | null
          photo_url?: string | null
          residential_address?: string | null
          status_manual?:
            | Database["public"]["Enums"]["member_status_manual"]
            | null
          status_reason?: string | null
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
          join_reason?: string | null
          marital_status?: string | null
          name?: string
          occupation?: string | null
          phone_number?: string | null
          photo_url?: string | null
          residential_address?: string | null
          status_manual?:
            | Database["public"]["Enums"]["member_status_manual"]
            | null
          status_reason?: string | null
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
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      registration_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          token?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_templates: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          close_day_of_week: number
          close_time: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          open_day_of_week: number
          open_time: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          close_day_of_week: number
          close_time: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          open_day_of_week: number
          open_time: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          close_day_of_week?: number
          close_time?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          open_day_of_week?: number
          open_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      get_follow_up_assignment: {
        Args: { p_token: string }
        Returns: {
          member_name: string
          status: string
        }[]
      }
      get_monthly_attendance: {
        Args: { p_months?: number }
        Returns: {
          active_member_count: number
          activity_count: number
          month_start: string
          present_count: number
        }[]
      }
      get_needs_follow_up: {
        Args: { p_threshold?: number }
        Returns: {
          consecutive_absences: number
          last_contacted_at: string
          last_contacted_by: string
          member_id: string
          member_name: string
          total_attendance_activities: number
        }[]
      }
      get_open_checkin_link: {
        Args: never
        Returns: {
          link_token: string
          title: string
        }[]
      }
      get_open_review_link: {
        Args: never
        Returns: {
          link_token: string
          title: string
        }[]
      }
      get_registration_link: {
        Args: { p_token: string }
        Returns: {
          is_active: boolean
        }[]
      }
      get_review_activity: {
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
      get_weekly_engagement_components: {
        Args: { p_weeks?: number }
        Returns: {
          attendance_present: number
          attendance_total: number
          review_present: number
          review_total: number
          week_start: string
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
      mark_member_contacted: {
        Args: { p_member_id: string }
        Returns: undefined
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
          p_no_location?: boolean
        }
        Returns: {
          geofence_outcome: Database["public"]["Enums"]["geofence_outcome"]
          outcome: string
          submission_status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
        }[]
      }
      submit_follow_up_feedback: {
        Args: { p_feedback_note?: string; p_token: string }
        Returns: {
          outcome: string
        }[]
      }
      submit_message_review: {
        Args: {
          p_confirmed: boolean
          p_keyword: string
          p_link_token: string
          p_member_id: string
          p_rating: number
          p_reflection: string
        }
        Returns: {
          outcome: string
          submission_status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string
        }[]
      }
      submit_registration_request: {
        Args: {
          p_anniversary_date?: string
          p_birthday?: string
          p_gender?: string
          p_join_reason?: string
          p_marital_status?: string
          p_name: string
          p_occupation?: string
          p_phone_number?: string
          p_residential_address?: string
          p_token: string
        }
        Returns: {
          outcome: string
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
        | "super_admin"
      geofence_outcome: "match" | "mismatch" | "unknown"
      member_status_manual:
        | "active"
        | "relocated"
        | "suspended"
        | "out_of_town"
        | "other"
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
        "super_admin",
      ],
      geofence_outcome: ["match", "mismatch", "unknown"],
      member_status_manual: [
        "active",
        "relocated",
        "suspended",
        "out_of_town",
        "other",
      ],
      submission_status: ["present", "absent", "excused"],
    },
  },
} as const
