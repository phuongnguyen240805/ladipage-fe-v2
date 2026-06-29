// TypeScript Types: database.types.ts
// Description: Type safety mappings for Supabase PostgreSQL schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          workspace_id: string
          user_id: string
          role: 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          workspace_id: string
          user_id: string
          role: 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          workspace_id?: string
          user_id?: string
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      pages: {
        Row: {
          id: string
          workspace_id: string
          slug: string
          name: string
          draft_data: Json
          published_data: Json | null
          bg_color: string | null
          primary_color: string | null
          font_family: string | null
          custom_domain: string | null
          pixel_id: string | null
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          slug: string
          name: string
          draft_data?: Json
          published_data?: Json | null
          bg_color?: string | null
          primary_color?: string | null
          font_family?: string | null
          custom_domain?: string | null
          pixel_id?: string | null
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          slug?: string
          name?: string
          draft_data?: Json
          published_data?: Json | null
          bg_color?: string | null
          primary_color?: string | null
          font_family?: string | null
          custom_domain?: string | null
          pixel_id?: string | null
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
          updated_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          }
        ]
      }
      forms: {
        Row: {
          id: string
          page_id: string
          name: string
          fields: Json
          submit_color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          name: string
          fields?: Json
          submit_color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          name?: string
          fields?: Json
          submit_color?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          }
        ]
      }
      form_submissions: {
        Row: {
          id: string
          form_id: string
          page_id: string
          data: Json
          status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'SPAM'
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          page_id: string
          data?: Json
          status?: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'SPAM'
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          page_id?: string
          data?: Json
          status?: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'SPAM'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          }
        ]
      }
      funnels: {
        Row: {
          id: string
          page_id: string
          name: string
          trigger_type: 'immediate' | 'scroll' | 'exit_intent' | 'inactivity'
          trigger_value: number | null
          action_type: 'show_popup' | 'redirect_url'
          action_data: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          name: string
          trigger_type: 'immediate' | 'scroll' | 'exit_intent' | 'inactivity'
          trigger_value?: number | null
          action_type: 'show_popup' | 'redirect_url'
          action_data?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          name?: string
          trigger_type?: 'immediate' | 'scroll' | 'exit_intent' | 'inactivity'
          trigger_value?: number | null
          action_type?: 'show_popup' | 'redirect_url'
          action_data?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnels_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          }
        ]
      }
      funnel_events: {
        Row: {
          id: number
          page_id: string
          session_id: string
          event_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: number
          page_id: string
          session_id: string
          event_type: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: number
          page_id?: string
          session_id?: string
          event_type?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: {
          workspace_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
