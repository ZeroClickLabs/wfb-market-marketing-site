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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          market_id: string | null
          title: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          market_id?: string | null
          title: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          market_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notes: {
        Row: {
          author_id: string | null
          author_name: string
          author_org: string | null
          body: string
          created_at: string
          id: string
          market_id: string
        }
        Insert: {
          author_id?: string | null
          author_name: string
          author_org?: string | null
          body: string
          created_at?: string
          id?: string
          market_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          author_org?: string | null
          body?: string
          created_at?: string
          id?: string
          market_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_notes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tasks: {
        Row: {
          created_at: string
          created_by: string | null
          done_at: string | null
          done_by: string | null
          due_date: string | null
          id: string
          market_id: string
          notes: string | null
          owner: Database["public"]["Enums"]["task_owner"]
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          done_at?: string | null
          done_by?: string | null
          due_date?: string | null
          id?: string
          market_id: string
          notes?: string | null
          owner?: Database["public"]["Enums"]["task_owner"]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          done_at?: string | null
          done_by?: string | null
          due_date?: string | null
          id?: string
          market_id?: string
          notes?: string | null
          owner?: Database["public"]["Enums"]["task_owner"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tasks_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          body: string
          created_at: string
          id: string
          market_id: string | null
          published: boolean
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          market_id?: string | null
          published?: boolean
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          market_id?: string | null
          published?: boolean
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_dates: {
        Row: {
          address: string | null
          closes_at: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          date: string
          id: string
          load_in_at: string | null
          location: string | null
          map_url: string | null
          market_id: string
          opens_at: string | null
          status: Database["public"]["Enums"]["date_status"]
          teardown_by: string | null
          updated_at: string
          vendor_notes: string | null
        }
        Insert: {
          address?: string | null
          closes_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          date: string
          id?: string
          load_in_at?: string | null
          location?: string | null
          map_url?: string | null
          market_id: string
          opens_at?: string | null
          status?: Database["public"]["Enums"]["date_status"]
          teardown_by?: string | null
          updated_at?: string
          vendor_notes?: string | null
        }
        Update: {
          address?: string | null
          closes_at?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          date?: string
          id?: string
          load_in_at?: string | null
          location?: string | null
          map_url?: string | null
          market_id?: string
          opens_at?: string | null
          status?: Database["public"]["Enums"]["date_status"]
          teardown_by?: string | null
          updated_at?: string
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_dates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_partners: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string | null
          market_id: string
          name: string
          organisation: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          market_id: string
          name: string
          organisation: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          market_id?: string
          name?: string
          organisation?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_partners_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["market_kind"]
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["market_kind"]
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["market_kind"]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      participation: {
        Row: {
          created_at: string
          market_date_id: string
          reminded_at: string | null
          responded_at: string | null
          stall: string | null
          status: Database["public"]["Enums"]["participation_status"]
          updated_at: string
          vendor_id: string
          vendor_note: string | null
        }
        Insert: {
          created_at?: string
          market_date_id: string
          reminded_at?: string | null
          responded_at?: string | null
          stall?: string | null
          status?: Database["public"]["Enums"]["participation_status"]
          updated_at?: string
          vendor_id: string
          vendor_note?: string | null
        }
        Update: {
          created_at?: string
          market_date_id?: string
          reminded_at?: string | null
          responded_at?: string | null
          stall?: string | null
          status?: Database["public"]["Enums"]["participation_status"]
          updated_at?: string
          vendor_id?: string
          vendor_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participation_market_date_id_fkey"
            columns: ["market_date_id"]
            isOneToOne: false
            referencedRelation: "market_dates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      update_recipients: {
        Row: {
          read_at: string | null
          update_id: string
          vendor_id: string
        }
        Insert: {
          read_at?: string | null
          update_id: string
          vendor_id: string
        }
        Update: {
          read_at?: string | null
          update_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_recipients_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_recipients_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          audience_kind: Database["public"]["Enums"]["audience_kind"]
          audience_market_id: string | null
          author_id: string | null
          author_org: string | null
          author_role: Database["public"]["Enums"]["user_role"] | null
          body: string
          created_at: string
          emailed_at: string | null
          id: string
          pinned: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience_kind?: Database["public"]["Enums"]["audience_kind"]
          audience_market_id?: string | null
          author_id?: string | null
          author_org?: string | null
          author_role?: Database["public"]["Enums"]["user_role"] | null
          body?: string
          created_at?: string
          emailed_at?: string | null
          id?: string
          pinned?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience_kind?: Database["public"]["Enums"]["audience_kind"]
          audience_market_id?: string | null
          author_id?: string | null
          author_org?: string | null
          author_role?: Database["public"]["Enums"]["user_role"] | null
          body?: string
          created_at?: string
          emailed_at?: string | null
          id?: string
          pinned?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "updates_audience_market_id_fkey"
            columns: ["audience_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          business_name: string
          category: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          insurance_confirmed: boolean
          markets: string[]
          phone: string | null
          products: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          town: string | null
          vendor_id: string | null
        }
        Insert: {
          business_name: string
          category?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          insurance_confirmed?: boolean
          markets?: string[]
          phone?: string | null
          products?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          town?: string | null
          vendor_id?: string | null
        }
        Update: {
          business_name?: string
          category?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          insurance_confirmed?: boolean
          markets?: string[]
          phone?: string | null
          products?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          town?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string | null
          is_primary: boolean
          name: string | null
          phone: string | null
          role: string | null
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          is_primary?: boolean
          name?: string | null
          phone?: string | null
          role?: string | null
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          is_primary?: boolean
          name?: string | null
          phone?: string | null
          role?: string | null
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_markets: {
        Row: {
          created_at: string
          market_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          market_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          market_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_markets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_markets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_members: {
        Row: {
          created_at: string
          email_updates: boolean
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          email_updates?: boolean
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          email_updates?: boolean
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_members_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_notes: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["note_kind"]
          vendor_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["note_kind"]
          vendor_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["note_kind"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          categories: string[]
          created_at: string
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          name: string
          phone: string | null
          photo_path: string | null
          products: string[]
          profile_pending_review: boolean
          profile_published: boolean
          published_profile: Json | null
          source: Database["public"]["Enums"]["vendor_source"]
          status: Database["public"]["Enums"]["vendor_status"]
          stripe_account_id: string | null
          town: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          categories?: string[]
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name: string
          phone?: string | null
          photo_path?: string | null
          products?: string[]
          profile_pending_review?: boolean
          profile_published?: boolean
          published_profile?: Json | null
          source?: Database["public"]["Enums"]["vendor_source"]
          status?: Database["public"]["Enums"]["vendor_status"]
          stripe_account_id?: string | null
          town?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          categories?: string[]
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string
          phone?: string | null
          photo_path?: string | null
          products?: string[]
          profile_pending_review?: boolean
          profile_published?: boolean
          published_profile?: Json | null
          source?: Database["public"]["Enums"]["vendor_source"]
          status?: Database["public"]["Enums"]["vendor_status"]
          stripe_account_id?: string | null
          town?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: "new" | "approved" | "declined"
      asset_kind: "logo" | "social" | "poster" | "photo" | "other"
      audience_kind: "all" | "market" | "vendors"
      date_status: "scheduled" | "cancelled" | "moved"
      market_kind: "summer" | "night" | "popup" | "winter"
      note_kind: "note" | "email" | "call" | "meeting"
      participation_status: "invited" | "confirmed" | "declined"
      task_owner: "market" | "partner"
      user_role: "admin" | "vendor" | "partner"
      vendor_source: "application" | "manual"
      vendor_status:
        | "lead"
        | "applied"
        | "approved"
        | "active"
        | "inactive"
        | "declined"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      application_status: ["new", "approved", "declined"],
      asset_kind: ["logo", "social", "poster", "photo", "other"],
      audience_kind: ["all", "market", "vendors"],
      date_status: ["scheduled", "cancelled", "moved"],
      market_kind: ["summer", "night", "popup", "winter"],
      note_kind: ["note", "email", "call", "meeting"],
      participation_status: ["invited", "confirmed", "declined"],
      task_owner: ["market", "partner"],
      user_role: ["admin", "vendor", "partner"],
      vendor_source: ["application", "manual"],
      vendor_status: [
        "lead",
        "applied",
        "approved",
        "active",
        "inactive",
        "declined",
      ],
    },
  },
} as const
