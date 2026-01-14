'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

// --- Regional Manager Actions ---

export async function getRegionalOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Use admin client to ensure we can read the employee's region assignment
  const adminClient = createAdminClient()

  // Get current user's region
  const { data: employeeData } = await adminClient
    .from('employees')
    .select('region_id, regions(name)')
    .eq('id', user.id)
    .single()

  const employee = employeeData as any

  if (!employee || !employee.region_id) return { error: 'No region assigned' }

  const regionId = employee.region_id
  const { year, month } = getCurrentPeriod()

  // Get all shops in region - use adminClient here too to ensure visibility
  const { data: shopsData } = await adminClient
    .from('shops')
    .select('id, name')
    .eq('region_id', regionId)
    .order('name')

  const shops = (shopsData || []) as any[]

  if (!shops.length) return { shops: [] }

  // Calculate stats for each shop
  const shopsWithStats = await Promise.all(shops.map(async (shop) => {
    // Get employees for this shop
    const { data: employeesData } = await adminClient
      .from('employees')
      .select('id')
      .eq('shop_id', shop.id)

    const employees = employeesData as any[]

    if (!employees || employees.length === 0) {
      return { ...shop, wireless: 0, wireline: 0, revenue: 0, employees: 0 }
    }

    const employeeIds = employees.map(e => e.id)

    // Get stats for this month
    const { data: sales } = await adminClient
      .from('sales')
      .select('category')
      .in('employee_id', employeeIds)
      .eq('year', year)
      .eq('month', month)

    const wireless = sales?.filter((s: any) => s.category === 'Wireless').length || 0
    const wireline = sales?.filter((s: any) => s.category === 'Wireline').length || 0

    return {
      ...shop,
      wireless,
      wireline,
      employees: employees.length
    }
  }))

  // Aggregate for region overview
  const totalWireless = shopsWithStats.reduce((sum, s) => sum + s.wireless, 0)
  const totalWireline = shopsWithStats.reduce((sum, s) => sum + s.wireline, 0)

  return {
    regionName: employee.regions?.name || 'Unknown Region',
    shops: shopsWithStats,
    totalWireless,
    totalWireline,
    year,
    month
  }
}

export async function createShop(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Get region
  const { data: employeeData } = await supabase
    .from('employees')
    .select('region_id')
    .eq('id', user.id)
    .single()

  const employee = employeeData as any

  if (!employee?.region_id) return { error: 'No region found' }

  const { error } = await (supabase.from('shops') as any).insert({
    name,
    region_id: employee.region_id
  })

  if (error) return { error: error.message }
  revalidatePath('/region')
  return { success: true }
}

export async function createShopManager(params: {
  email: string
  name: string
  password: string
  shopId: string
}) {
  // Use admin client to create auth user
  const adminClient = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: { name: params.name }
  })

  if (authError) return { error: authError.message }

  // Update employee record
  const { error: updateError } = await (adminClient.from('employees') as any)
    .update({
      name: params.name,
      role: 'shop_manager',
      shop_id: params.shopId,
      employment_percentage: 100
    })
    .eq('id', authData.user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/region')
  return { success: true }
}
