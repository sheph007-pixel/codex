export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          microsoft_id: string | null;
          supabase_auth_id: string | null;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          microsoft_id?: string | null;
          supabase_auth_id?: string | null;
          email: string;
          display_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          domain: string;
          company_name: string | null;
          company_type: "Lead" | "Current Client" | "Old Client" | null;
          is_starred: boolean;
          is_archived: boolean;
          is_flagged: boolean;
          is_blocked: boolean;
          is_followup: boolean;
          followup_date: string | null;
          last_activity_date: string | null;
          last_sent_date: string | null;
          last_received_date: string | null;
          sent_count: number;
          received_count: number;
          proposal_stage: string | null;
          proposal_notes: string | null;
          merged_into: string | null;
          enrichment: Json;
          custom_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain: string;
          company_name?: string | null;
          company_type?: "Lead" | "Current Client" | "Old Client" | null;
          is_starred?: boolean;
          is_archived?: boolean;
          is_flagged?: boolean;
          is_blocked?: boolean;
          is_followup?: boolean;
          followup_date?: string | null;
          last_activity_date?: string | null;
          last_sent_date?: string | null;
          last_received_date?: string | null;
          sent_count?: number;
          received_count?: number;
          proposal_stage?: string | null;
          proposal_notes?: string | null;
          merged_into?: string | null;
          enrichment?: Json;
          custom_data?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          email: string;
          name: string | null;
          is_starred: boolean;
          last_activity_date: string | null;
          sent_count: number;
          received_count: number;
          enrichment: Json;
          attributes: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          email: string;
          name?: string | null;
          is_starred?: boolean;
          last_activity_date?: string | null;
          sent_count?: number;
          received_count?: number;
          enrichment?: Json;
          attributes?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string | null;
          company_id: string | null;
          type: string;
          title: string;
          description: string | null;
          metadata: Json;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id?: string | null;
          company_id?: string | null;
          type: string;
          title: string;
          description?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key: string;
          value?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Insert"]>;
      };
      scan_metadata: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          last_scan_time: string | null;
          full_scan_done: boolean;
          delta_link: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id: string;
          last_scan_time?: string | null;
          full_scan_done?: boolean;
          delta_link?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["scan_metadata"]["Insert"]>;
      };
    };
  };
}

// Convenience type aliases
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
