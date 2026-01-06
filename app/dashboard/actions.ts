'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

export async function logSale(category: 'Wireless' | 'Wireline') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current period
  const { year, month } = getCurrentPeriod()

  // Insert new sale
  const { error: insertError } = await supabase
    .from('sales')
    .insert({
      employee_id: user.id,
      category: category,
      year,
      month,
    } as any)

  if (insertError) {
    return { error: insertError.message }
  }

  // Get updated counts for current month
  const { data: sales } = await supabase
    .from('sales')
    .select('category')
    .eq('employee_id', user.id)
    .eq('year', year)
    .eq('month', month)

  const wirelessCount = (sales as any)?.filter((s: any) => s.category === 'Wireless').length || 0
  const wirelineCount = (sales as any)?.filter((s: any) => s.category === 'Wireline').length || 0

  revalidatePath('/dashboard')
  return { 
    success: true, 
    wirelessCount,
    wirelineCount,
    year,
    month
  }
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
    .select('*, shops(name)')
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
        role: 'internal_sales',
        employment_percentage: 100,
      } as any)
      .select('*, shops(name)')
      .single()

    if (createError) {
      return { error: 'Failed to create employee record' }
    }

    employee = newEmployee
  }

  // Get current period
  const { year, month } = getCurrentPeriod()

  // Get current month's sales
  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('employee_id', user.id)
    .eq('year', year)
    .eq('month', month)
    .order('created_at', { ascending: false })

  // Get current month's target
  const { data: target } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('employee_id', user.id)
    .eq('year', year)
    .eq('month', month)
    .single()

  // Count sales by category
  const wirelessCount = (sales as any)?.filter((s: any) => s.category === 'Wireless').length || 0
  const wirelineCount = (sales as any)?.filter((s: any) => s.category === 'Wireline').length || 0

  const wirelessTarget = (target as any)?.wireless_target || 0
  const wirelineTarget = (target as any)?.wireline_target || 0

  // Calculate ZER and projected bonus (only for sales roles)
  let projectedBonus = 0
  let wirelessZER = 0
  let wirelineZER = 0

  if (employee && (employee as any).role !== 'shop_manager') {
    const { calculateEmployeeBonus } = await import('@/lib/bonus-calculator')
    const bonusCalc = calculateEmployeeBonus({
      role: (employee as any).role,
      wirelessCount,
      wirelineCount,
      wirelessTarget,
      wirelineTarget,
      employmentPercentage: (employee as any).employment_percentage || 100,
    })
    
    projectedBonus = bonusCalc.cappedBonus
    wirelessZER = bonusCalc.wirelessZER
    wirelineZER = bonusCalc.wirelineZER
  } else {
    // For managers, calculate based on shop gZER
    // Get all employees in the same shop
    if (employee && (employee as any).shop_id) {
      const { data: shopEmployees } = await supabase
        .from('employees')
        .select('id, role, employment_percentage')
        .eq('shop_id', (employee as any).shop_id)
        .neq('role', 'shop_manager')

      if (shopEmployees && shopEmployees.length > 0) {
        const { calculateShopGZER, calculateShopManagerBonus } = await import('@/lib/bonus-calculator')
        
        // Get ZERs for all shop employees
        const employeeZERs = await Promise.all(
          (shopEmployees as any[]).map(async (emp: any) => {
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

            const empWirelessCount = (empSales as any)?.filter((s: any) => s.category === 'Wireless').length || 0
            const empWirelineCount = (empSales as any)?.filter((s: any) => s.category === 'Wireline').length || 0

            const { calculateEmployeeBonus } = await import('@/lib/bonus-calculator')
            const empBonus = calculateEmployeeBonus({
              role: emp.role,
              wirelessCount: empWirelessCount,
              wirelineCount: empWirelineCount,
              wirelessTarget: (empTarget as any)?.wireless_target || 0,
              wirelineTarget: (empTarget as any)?.wireline_target || 0,
              employmentPercentage: emp.employment_percentage || 100,
            })

            return {
              wirelessZER: empBonus.wirelessZER,
              wirelineZER: empBonus.wirelineZER,
            }
          })
        )

        const shopGZER = calculateShopGZER(employeeZERs)
        const managerBonus = calculateShopManagerBonus(shopGZER)
        projectedBonus = managerBonus.bonusAmount
        wirelessZER = shopGZER
        wirelineZER = shopGZER
      }
    }
  }

  return {
    employee,
    sales: sales || [],
    wirelessCount,
    wirelineCount,
    wirelessTarget,
    wirelineTarget,
    wirelessZER,
    wirelineZER,
    projectedBonus,
    year,
    month,
    hasTarget: !!target,
  }
}
