'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type LeaderboardEntry = {
  id: string
  name: string
  email: string
  totalSales: number
  internetSales: number
  mobileSales: number
  currentTier: Database['public']['Tables']['bonus_tiers']['Row'] | null
}

export async function getLeaderboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch all employees with their sales
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select(`
      *,
      sales (
        id,
        category
      )
    `)
    .neq('email', 'list@admin.com')

  if (employeesError) {
    return { error: employeesError.message }
  }

  // Fetch all tiers
  const { data: tiers } = await supabase
    .from('bonus_tiers')
    .select('*')
    .order('contracts_required', { ascending: true })
    .returns<Database['public']['Tables']['bonus_tiers']['Row'][]>()

  if (!tiers) {
    return { error: 'Failed to load tiers' }
  }

  if (!employees) {
    return { error: 'No employees found' }
  }

  // Process data to calculate stats for each employee
  const leaderboard: LeaderboardEntry[] = employees.map((emp: any) => {
    const totalSales = emp.sales?.length || 0
    const internetSales = emp.sales?.filter((s: any) => s.category === 'Internet').length || 0
    const mobileSales = emp.sales?.filter((s: any) => s.category === 'Mobile').length || 0

    // Find current tier
    // Tiers are sorted by contracts_required ascending
    // We want the highest tier where contracts_required <= totalSales
    let currentTier = tiers[0] || null // Default to first tier (Starter)

    for (let i = tiers.length - 1; i >= 0; i--) {
      const tier = tiers[i]
      if (tier && totalSales >= tier.contracts_required) {
        currentTier = tier
        break
      }
    }

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      totalSales,
      internetSales,
      mobileSales,
      currentTier
    }
  })

  // Sort by sales (descending)
  leaderboard.sort((a, b) => b.totalSales - a.totalSales)

  return { leaderboard }
}
