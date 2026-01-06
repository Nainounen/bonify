'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentPeriod, calculateEmployeeBonus, calculateShopGZER } from '@/lib/bonus-calculator'

export async function getAdminStats() {
  const supabase = await createClient()
  const { year, month } = getCurrentPeriod()

  const { data: sales, error } = await supabase
    .from('sales')
    .select('category, created_at, employee_id, year, month, employees(name, email)')
    .eq('year', year)
    .eq('month', month)

  if (error) {
    console.error('Error fetching sales:', error)
    return { wireless: 0, wireline: 0, total: 0, salesByDate: [], salesByUserAndDate: [], avgZER: 0 }
  }

  // Filter out admin and list users
  const filteredSales = sales.filter((s: any) => 
    s.employees?.email !== 'admin@admin.com' && 
    s.employees?.email !== 'list@admin.com'
  )

  const wireless = filteredSales.filter((s: any) => s.category === 'Wireless').length
  const wireline = filteredSales.filter((s: any) => s.category === 'Wireline').length

  // Group sales by date for the chart (aggregate view)
  const salesByDateMap = filteredSales.reduce((acc: any, sale: any) => {
    const date = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!acc[date]) {
      acc[date] = { date, wireless: 0, wireline: 0 }
    }
    if (sale.category === 'Wireless') acc[date].wireless++
    if (sale.category === 'Wireline') acc[date].wireline++
    return acc
  }, {})

  const salesByDate = Object.values(salesByDateMap).sort((a: any, b: any) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ).slice(-7) // Last 7 days

  // Group sales by user, date, and category for individual user trend lines
  const salesByUserMap: any = {}
  
  filteredSales.forEach((sale: any) => {
    const date = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const userName = sale.employees?.name || 'Unknown'
    const key = `${userName}-${sale.category}`
    
    if (!salesByUserMap[key]) {
      salesByUserMap[key] = {
        userName,
        category: sale.category,
        salesByDate: {}
      }
    }
    
    if (!salesByUserMap[key].salesByDate[date]) {
      salesByUserMap[key].salesByDate[date] = 0
    }
    
    salesByUserMap[key].salesByDate[date]++
  })

  // Convert to array format suitable for recharts
  const salesByUserAndDate = Object.values(salesByUserMap).map((userData: any) => {
    const dates = Object.keys(userData.salesByDate).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    ).slice(-7)
    
    return {
      userName: userData.userName,
      category: userData.category,
      data: dates.map(date => ({
        date,
        count: userData.salesByDate[date]
      }))
    }
  })

  // Calculate average ZER across all employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, role, employment_percentage')
    .neq('email', 'admin@admin.com')
    .neq('email', 'list@admin.com')

  let avgZER = 0
  if (employees && employees.length > 0) {
    const employeeZERs = await Promise.all(
      employees.map(async (emp: any) => {
        const { data: empTarget } = await supabase
          .from('monthly_targets')
          .select('*')
          .eq('employee_id', emp.id)
          .eq('year', year)
          .eq('month', month)
          .single()

        if (!empTarget) return null

        const empSales = filteredSales.filter((s: any) => s.employee_id === emp.id)
        const empWirelessCount = empSales.filter((s: any) => s.category === 'Wireless').length
        const empWirelineCount = empSales.filter((s: any) => s.category === 'Wireline').length

        const bonusCalc = calculateEmployeeBonus({
          role: emp.role,
          wirelessCount: empWirelessCount,
          wirelineCount: empWirelineCount,
          wirelessTarget: empTarget.wireless_target,
          wirelineTarget: empTarget.wireline_target,
          employmentPercentage: emp.employment_percentage || 100,
        })

        return {
          wirelessZER: bonusCalc.wirelessZER,
          wirelineZER: bonusCalc.wirelineZER,
        }
      })
    )

    const validZERs = employeeZERs.filter(z => z !== null) as { wirelessZER: number; wirelineZER: number }[]
    if (validZERs.length > 0) {
      avgZER = calculateShopGZER(validZERs)
    }
  }

  return {
    wireless,
    wireline,
    total: filteredSales.length,
    salesByDate,
    salesByUserAndDate,
    avgZER,
    year,
    month,
  }
}

export async function getUsers() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('employees')
    .select('*, sales(id, category, created_at)')
    .order('name')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  // Filter out admin and list users
  const filteredUsers = users.filter((user: any) => 
    user.email !== 'admin@admin.com' && 
    user.email !== 'list@admin.com'
  )

  return filteredUsers
}

export async function deleteAllSales() {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sales')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // First delete their sales
  const { error: salesError } = await supabase
    .from('sales')
    .delete()
    .eq('employee_id', userId)

  if (salesError) {
    return { error: salesError.message }
  }

  // Then delete the employee record
  const { error: userError } = await supabase
    .from('employees')
    .delete()
    .eq('id', userId)

  if (userError) {
    return { error: userError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function getMonthlyTargets(year: number, month: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('monthly_targets')
    .select('*, employees(name, email, role)')
    .eq('year', year)
    .eq('month', month)

  if (error) {
    return { error: error.message }
  }

  return { targets: data || [] }
}

export async function setMonthlyTarget(params: {
  employeeId: string
  year: number
  month: number
  wirelessTarget: number
  wirelineTarget: number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('monthly_targets')
    .upsert({
      employee_id: params.employeeId,
      year: params.year,
      month: params.month,
      wireless_target: params.wirelessTarget,
      wireline_target: params.wirelineTarget,
    } as any)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateEmployee(params: {
  employeeId: string
  role: string
  employmentPercentage: number
  shopId: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('employees')
    .update({
      role: params.role,
      employment_percentage: params.employmentPercentage,
      shop_id: params.shopId,
    } as any)
    .eq('id', params.employeeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function getShops() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .order('name')

  if (error) {
    return { error: error.message }
  }

  return { shops: data || [] }
}

export async function calculateAllMonthlyBonuses(year: number, month: number) {
  const supabase = await createClient()

  // Get all employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, role, employment_percentage, shop_id')
    .neq('email', 'admin@admin.com')
    .neq('email', 'list@admin.com')

  if (!employees) {
    return { error: 'Failed to fetch employees' }
  }

  const bonuses = []

  for (const employee of employees) {
    // Get employee's sales for the month
    const { data: sales } = await supabase
      .from('sales')
      .select('category')
      .eq('employee_id', employee.id)
      .eq('year', year)
      .eq('month', month)

    const wirelessCount = sales?.filter(s => s.category === 'Wireless').length || 0
    const wirelineCount = sales?.filter(s => s.category === 'Wireline').length || 0

    // Get employee's targets
    const { data: target } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('year', year)
      .eq('month', month)
      .single()

    if (!target) continue

    let bonusAmount = 0
    let wirelessZER = 0
    let wirelineZER = 0
    let level1WirelessOrders = 0
    let level1WirelineOrders = 0
    let level2WirelessOrders = 0
    let level2WirelineOrders = 0

    if (employee.role === 'shop_manager') {
      // Calculate shop gZER for managers
      if (employee.shop_id) {
        const { data: shopEmployees } = await supabase
          .from('employees')
          .select('id, role, employment_percentage')
          .eq('shop_id', employee.shop_id)
          .neq('role', 'shop_manager')

        if (shopEmployees && shopEmployees.length > 0) {
          const { calculateShopGZER, calculateShopManagerBonus } = await import('@/lib/bonus-calculator')
          
          const employeeZERs = await Promise.all(
            shopEmployees.map(async (emp: any) => {
              const { data: empSales } = await supabase
                .from('sales')
                .select('category')
                .eq('employee_id', emp.id)
                .eq('year', year)
                .eq('month', month)

              const { data: empTarget } = await supabase
                .from('monthly_targets')
                .select('*')
                .eq('employee_id', emp.id)
                .eq('year', year)
                .eq('month', month)
                .single()

              if (!empTarget) return null

              const empWirelessCount = empSales?.filter(s => s.category === 'Wireless').length || 0
              const empWirelineCount = empSales?.filter(s => s.category === 'Wireline').length || 0

              const empBonus = calculateEmployeeBonus({
                role: emp.role,
                wirelessCount: empWirelessCount,
                wirelineCount: empWirelineCount,
                wirelessTarget: empTarget.wireless_target,
                wirelineTarget: empTarget.wireline_target,
                employmentPercentage: emp.employment_percentage || 100,
              })

              return {
                wirelessZER: empBonus.wirelessZER,
                wirelineZER: empBonus.wirelineZER,
              }
            })
          )

          const validZERs = employeeZERs.filter(z => z !== null) as { wirelessZER: number; wirelineZER: number }[]
          if (validZERs.length > 0) {
            const shopGZER = calculateShopGZER(validZERs)
            const managerBonus = calculateShopManagerBonus(shopGZER)
            bonusAmount = managerBonus.bonusAmount
            wirelessZER = shopGZER
            wirelineZER = shopGZER
          }
        }
      }
    } else {
      // Calculate bonus for sales employees
      const bonusCalc = calculateEmployeeBonus({
        role: employee.role as any,
        wirelessCount,
        wirelineCount,
        wirelessTarget: target.wireless_target,
        wirelineTarget: target.wireline_target,
        employmentPercentage: employee.employment_percentage || 100,
      })

      bonusAmount = bonusCalc.cappedBonus
      wirelessZER = bonusCalc.wirelessZER
      wirelineZER = bonusCalc.wirelineZER
      level1WirelessOrders = bonusCalc.level1WirelessOrders
      level1WirelineOrders = bonusCalc.level1WirelineOrders
      level2WirelessOrders = bonusCalc.level2WirelessOrders
      level2WirelineOrders = bonusCalc.level2WirelineOrders
    }

    // Upsert bonus record
    await supabase
      .from('monthly_bonuses')
      .upsert({
        employee_id: employee.id,
        year,
        month,
        wireless_count: wirelessCount,
        wireline_count: wirelineCount,
        wireless_zer_percentage: wirelessZER,
        wireline_zer_percentage: wirelineZER,
        level1_wireless_orders: level1WirelessOrders,
        level1_wireline_orders: level1WirelineOrders,
        level2_wireless_orders: level2WirelessOrders,
        level2_wireline_orders: level2WirelineOrders,
        total_bonus_amount: bonusAmount,
        capped_bonus_amount: bonusAmount,
      } as any)

    bonuses.push({
      employeeId: employee.id,
      bonusAmount,
    })
  }

  revalidatePath('/admin')
  return { success: true, bonuses }
}
