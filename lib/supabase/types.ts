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
          role: 'internal_sales' | 'external_sales' | 'shop_manager' | 'regional_manager'
          employment_percentage: number
          shop_id: string | null
          region_id: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          role?: 'internal_sales' | 'external_sales' | 'shop_manager' | 'regional_manager'
          employment_percentage?: number
          shop_id?: string | null
          region_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          role?: 'internal_sales' | 'external_sales' | 'shop_manager' | 'regional_manager'
          employment_percentage?: number
          shop_id?: string | null
          region_id?: string | null
        }
      }
      shops: {
        Row: {
          id: string
          name: string
          created_at: string
          region_id: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          region_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          region_id?: string | null
        }
      }
      regions: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      monthly_targets: {
        Row: {
          id: string
          employee_id: string
          year: number
          month: number
          wireless_target: number
          wireline_target: number
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          year: number
          month: number
          wireless_target: number
          wireline_target: number
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          year?: number
          month?: number
          wireless_target?: number
          wireline_target?: number
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          employee_id: string
          category: 'Wireless' | 'Wireline'
          year: number
          month: number
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          category: 'Wireless' | 'Wireline'
          year: number
          month: number
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          category?: 'Wireless' | 'Wireline'
          year?: number
          month?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      employee_role: 'internal_sales' | 'external_sales' | 'shop_manager' | 'regional_manager'
      sale_category: 'Wireless' | 'Wireline'
    }
  }
}
