import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      asset_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          predefined_details: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          description?: string | null;
          predefined_details?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          predefined_details?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          user_id: string;
          asset_type_id: string;
          name: string;
          address: string;
          details: any[];
          tenant_id: string | null;
          status: 'occupied' | 'vacant' | 'maintenance';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          asset_type_id: string;
          name: string;
          address: string;
          details?: any[];
          tenant_id?: string | null;
          status?: 'occupied' | 'vacant' | 'maintenance';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_type_id?: string;
          name?: string;
          address?: string;
          details?: any[];
          tenant_id?: string | null;
          status?: 'occupied' | 'vacant' | 'maintenance';
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          email: string;
          phone: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      leases: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string;
          rent_amount: number;
          charge_period_minutes: number;
          frequency: number;
          deposit: number;
          status: 'active' | 'expired' | 'pending' | 'terminated';
          lease_type: 'fixed_term' | 'month_to_month';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          asset_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string;
          rent_amount?: number;
          charge_period_minutes?: number;
          frequency?: number;
          deposit?: number;
          status?: 'active' | 'expired' | 'pending' | 'terminated';
          lease_type?: 'fixed_term' | 'month_to_month';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_id?: string;
          tenant_id?: string;
          start_date?: string;
          end_date?: string;
          rent_amount?: number;
          charge_period_minutes?: number;
          frequency?: number;
          deposit?: number;
          status?: 'active' | 'expired' | 'pending' | 'terminated';
          lease_type?: 'fixed_term' | 'month_to_month';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          asset_id: string;
          amount: number;
          due_date: string;
          paid_date: string | null;
          status: 'paid' | 'pending' | 'overdue';
          method: 'cash' | 'check' | 'bank_transfer' | 'online' | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          tenant_id: string;
          asset_id: string;
          amount?: number;
          due_date: string;
          paid_date?: string | null;
          status?: 'paid' | 'pending' | 'overdue';
          method?: 'cash' | 'check' | 'bank_transfer' | 'online' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tenant_id?: string;
          asset_id?: string;
          amount?: number;
          due_date?: string;
          paid_date?: string | null;
          status?: 'paid' | 'pending' | 'overdue';
          method?: 'cash' | 'check' | 'bank_transfer' | 'online' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};