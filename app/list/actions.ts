'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCurrentPeriod, calculateEmployeeBonus } from '@/lib/bonus-calculator'

export type LeaderboardEntry = {
  id: string
  name: string
  email: string
  role: string
  totalSales: number
  wirelessSales: number
  wirelineSales: number
  wirelessZER: number
  wirelineZER: number
  projectedBonus: number
}

export async function getLeaderboard(year?: number, month?: number) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const current = getCurrentPeriod()
  const targetYear = year || current.year
  const targetMonth = month || current.month

  // Get current user info to determine visibility
  const { data: currentUserEmployee } = await adminClient
    .from('employees')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  let query = adminClient
    .from('employees')
    .select('*')
    .neq('email', 'list@admin.com')
    .neq('email', 'admin@admin.com')

  // Filter based on role
  // Regular employees and shop managers only see their own shop
  // Regional Managers and Directors see everyone
  const isPrivileged = currentUserEmployee && ['regional_manager', 'director'].includes(currentUserEmployee.role)
  const isAdmin = user.email === 'admin@admin.com'

  if (!isPrivileged && !isAdmin) {
    if (currentUserEmployee?.shop_id) {
      query = query.eq('shop_id', currentUserEmployee.shop_id)
    } else {
      // If no shop assigned, limit to self
      query = query.eq('id', user.id)
    }
  }

  // Fetch employees based on filter
  const { data: employees, error: employeesError } = await query

  if (employeesError) {
    return { error: employeesError.message }
  }

  if (!employees) {
    return { error: 'No employees found' }
  }

  // Process data to calculate stats for each employee
  const leaderboard: LeaderboardEntry[] = await Promise.all(
    employees.map(async (emp: any) => {
      // Get employee's sales for current month
      const { data: sales } = await adminClient
        .from('sales')
        .select('category')
        .eq('employee_id', emp.id)
        .eq('year', targetYear)
        .eq('month', targetMonth)

      const wirelessSales = sales?.filter((s: any) => s.category === 'Wireless').length || 0
      const wirelineSales = sales?.filter((s: any) => s.category === 'Wireline').length || 0
      const totalSales = wirelessSales + wirelineSales

      // Get employee's target for current month
      const { data: target } = await adminClient
        .from('monthly_targets')
        .select('*')
        .eq('employee_id', emp.id)
        .eq('year', targetYear)
        .eq('month', targetMonth)
        .single()

      let wirelessZER = 0
      let wirelineZER = 0
      let projectedBonus = 0

      if (target && emp.role !== 'shop_manager') {
        const bonusCalc = calculateEmployeeBonus({
          role: emp.role,
          wirelessCount: wirelessSales,
          wirelineCount: wirelineSales,
          wirelessTarget: (target as any).wireless_target || 0,
          wirelineTarget: (target as any).wireline_target || 0,
          employmentPercentage: emp.employment_percentage || 100,
        })

        wirelessZER = bonusCalc.wirelessZER
        wirelineZER = bonusCalc.wirelineZER
        projectedBonus = bonusCalc.cappedBonus
      }

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role || 'internal_sales',
        totalSales,
        wirelessSales,
        wirelineSales,
        wirelessZER,
        wirelineZER,
        projectedBonus,
      }
    })
  )

  // Sort by projected bonus (descending), then total sales
  leaderboard.sort((a, b) => {
    if (b.projectedBonus !== a.projectedBonus) {
      return b.projectedBonus - a.projectedBonus
    }
    return b.totalSales - a.totalSales
  })

  return { leaderboard }
}
