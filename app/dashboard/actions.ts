'use server'

// Use admin client for employee lookup to avoid RLS recursion issues during login
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

export async function logSale(category: 'Wireless' | 'Wireline') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Rest of the function...


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


export async function getEmployeeStats(year?: number, month?: number) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get employee info (create if doesn't exist)
  // Use adminClient to bypass potential RLS recursion on the employees table
  let { data: employeeData } = await adminClient
    .from('employees')
    .select('*, shops(name)')
    .eq('id', user.id)
    .single()

  let employee = employeeData as any

  // If employee doesn't exist, create it
  if (!employee) {
    const { data: newEmployee, error: createError } = await adminClient
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
      console.error('Failed to create employee:', createError)
      return { error: 'Failed to create employee record' }
    }

    employee = newEmployee
  }

  // Get current period or use provided
  const current = getCurrentPeriod()
  const targetYear = year || current.year
  const targetMonth = month || current.month

  // Get selected month's sales
  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('employee_id', user.id)
    .eq('year', targetYear)
    .eq('month', targetMonth)
    .order('created_at', { ascending: false })

  // Get selected month's target
  const { data: target } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('employee_id', user.id)
    .eq('year', targetYear)
    .eq('month', targetMonth)
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
    // For managers, calculate based on YTD percentage from monthly_targets
    const ytdPercentage = (target as any)?.shop_manager_ytd_percentage || 0
    const percentageForBonus = Math.min(Math.max(ytdPercentage, 100), 200)
    const percentagePoints = percentageForBonus - 100

    projectedBonus = Math.max(0, percentagePoints * 50)

    // Set ZER to YTD percentage for consistency
    wirelessZER = ytdPercentage
    wirelineZER = ytdPercentage
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
    year: targetYear,
    month: targetMonth,
    hasTarget: !!target,
  }
}
