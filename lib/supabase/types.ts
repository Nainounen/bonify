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
      employees: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      bonus_tiers: {
        Row: {
          id: number
          name: string
          contracts_required: number
          bonus_amount: number
          color: string
          icon: string
          order: number
        }
        Insert: {
          id?: number
          name: string
          contracts_required: number
          bonus_amount: number
          color: string
          icon: string
          order: number
        }
        Update: {
          id?: number
          name?: string
          contracts_required?: number
          bonus_amount?: number
          color?: string
          icon?: string
          order?: number
        }
      }
      sales: {
        Row: {
          id: string
          employee_id: string
          created_at: string
          bonus_tier_id: number | null
        }
        Insert: {
          id?: string
          employee_id: string
          created_at?: string
          bonus_tier_id?: number | null
        }
        Update: {
          id?: string
          employee_id?: string
          created_at?: string
          bonus_tier_id?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
