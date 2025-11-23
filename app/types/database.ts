/**
 * Database TypeScript Types
 * Generated from Supabase schema
 *
 * To regenerate:
 * supabase gen types typescript --project-id YOUR_PROJECT_ID > app/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "staff";
          is_active: boolean;
          created_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "staff";
          is_active?: boolean;
          created_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "admin" | "staff";
          is_active?: boolean;
          created_at?: string;
          last_login_at?: string | null;
        };
      };
      packaging_products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          unit_price: number;
          stock_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          unit_price: number;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          unit_price?: number;
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          packaging_product_id: string;
          quantity: number;
          total_price: number;
          status: "pending" | "processing" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          packaging_product_id: string;
          quantity: number;
          total_price: number;
          status?: "pending" | "processing" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          packaging_product_id?: string;
          quantity?: number;
          total_price?: number;
          status?: "pending" | "processing" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
