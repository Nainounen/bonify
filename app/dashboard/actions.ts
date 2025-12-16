'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export async function logSale(category: 'Internet' | 'Mobile') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current sales count for this category to determine tier
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('id, category')
    .eq('employee_id', user.id)

  if (salesError) {
    return { error: salesError.message }
  }

  // Count sales for the specific category
  const categorySales = (sales as Array<{ id: number; category: string }>)?.filter(s => s.category === category) || []
  const newCategoryCount = categorySales.length + 1

  // Get appropriate tier based on new category count
  const { data: tiers } = await supabase
    .from('bonus_tiers')
    .select('*')
    .lte('contracts_required', newCategoryCount)
    .order('contracts_required', { ascending: false })
    .limit(1)

  const currentTier = tiers?.[0] as Database['public']['Tables']['bonus_tiers']['Row'] | undefined

  // Insert new sale
  const { error: insertError } = await supabase
    .from('sales')
    .insert({
      employee_id: user.id,
      bonus_tier_id: currentTier?.id ?? null,
      category: category
    } as any)

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/dashboard')
  return { success: true, newCount: newCategoryCount, tier: currentTier }
}

export async function getEmployeeStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get employee info (create if doesn't exist)
  let { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  // If employee doesn't exist, create it
  if (!employee) {
    const { data: newEmployee, error: createError } = await supabase
      .from('employees')
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      } as any)
      .select()
      .single()

    if (createError) {
      return { error: 'Failed to create employee record' }
    }

    employee = newEmployee
  }

  // Get all sales
  const { data: sales } = await supabase
    .from('sales')
    .select('*, bonus_tiers(*)')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  type SaleWithTier = Database['public']['Tables']['sales']['Row'] & {
    bonus_tiers: Database['public']['Tables']['bonus_tiers']['Row'] | null
  }

  // Get all tiers
  const { data: tiers } = await supabase
    .from('bonus_tiers')
    .select('*')
    .order('order', { ascending: true })

  const totalSales = sales?.length || 0

  type BonusTier = Database['public']['Tables']['bonus_tiers']['Row']

  // Calculate current tier
  const currentTier = (tiers as BonusTier[] | null)?.filter(t => t.contracts_required <= totalSales)
    .sort((a, b) => b.contracts_required - a.contracts_required)[0]

  // Calculate next tier
  const nextTier = (tiers as BonusTier[] | null)?.find(t => t.contracts_required > totalSales)

  // Calculate total bonus earned
  const totalBonus = (sales as SaleWithTier[] | null)?.reduce((sum, sale) => {
    return sum + (sale.bonus_tiers?.bonus_amount || 0)
  }, 0) || 0

  return {
    employee,
    sales: sales || [],
    tiers: tiers || [],
    totalSales,
    currentTier,
    nextTier,
    totalBonus,
  }
}
