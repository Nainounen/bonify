'use server'

import { createClient } from '@/lib/supabase/server'
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

export async function getLeaderboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { year, month } = getCurrentPeriod()

  // Fetch all employees with their current month sales, excluding admin and list users
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .neq('email', 'list@admin.com')
    .neq('email', 'admin@admin.com')

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
      const { data: sales } = await supabase
        .from('sales')
        .select('category')
        .eq('employee_id', emp.id)
        .eq('year', year)
        .eq('month', month)

      const wirelessSales = sales?.filter((s: any) => s.category === 'Wireless').length || 0
      const wirelineSales = sales?.filter((s: any) => s.category === 'Wireline').length || 0
      const totalSales = wirelessSales + wirelineSales

      // Get employee's target for current month
      const { data: target } = await supabase
        .from('monthly_targets')
        .select('*')
        .eq('employee_id', emp.id)
        .eq('year', year)
        .eq('month', month)
        .single()

      let wirelessZER = 0
      let wirelineZER = 0
      let projectedBonus = 0

      if (target && emp.role !== 'shop_manager') {
        const bonusCalc = calculateEmployeeBonus({
          role: emp.role,
          wirelessCount: wirelessSales,
          wirelineCount: wirelineSales,
          wirelessTarget: target.wireless_target || 0,
          wirelineTarget: target.wireline_target || 0,
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
