'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function logSale() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current sales count to determine tier
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('id')
    .eq('employee_id', user.id)

  if (salesError) {
    return { error: salesError.message }
  }

  const newCount = (sales?.length || 0) + 1

  // Get appropriate tier based on new count
  const { data: tiers } = await supabase
    .from('bonus_tiers')
    .select('*')
    .lte('contracts_required', newCount)
    .order('contracts_required', { ascending: false })
    .limit(1)

  const currentTier = tiers?.[0]

  // Insert new sale
  const { error: insertError } = await supabase
    .from('sales')
    .insert({
      employee_id: user.id,
      bonus_tier_id: currentTier?.id || null,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/dashboard')
  return { success: true, newCount, tier: currentTier }
}

export async function getEmployeeStats() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get employee info
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all sales
  const { data: sales } = await supabase
    .from('sales')
    .select('*, bonus_tiers(*)')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  // Get all tiers
  const { data: tiers } = await supabase
    .from('bonus_tiers')
    .select('*')
    .order('order', { ascending: true })

  const totalSales = sales?.length || 0
  
  // Calculate current tier
  const currentTier = tiers?.filter(t => t.contracts_required <= totalSales)
    .sort((a, b) => b.contracts_required - a.contracts_required)[0]
  
  // Calculate next tier
  const nextTier = tiers?.find(t => t.contracts_required > totalSales)
  
  // Calculate total bonus earned
  const totalBonus = sales?.reduce((sum, sale) => {
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
