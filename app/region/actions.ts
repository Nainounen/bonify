'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

// --- Regional Manager Actions ---

export async function getRegionalOverview(year?: number, month?: number) {
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
  const current = getCurrentPeriod()
  const targetYear = year || current.year
  const targetMonth = month || current.month

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
      .select('id, name, email, role')
      .eq('shop_id', shop.id)

    const employees = employeesData as any[]

    if (!employees || employees.length === 0) {
      return { ...shop, wireless: 0, wireline: 0, revenue: 0, employees: 0, manager: null }
    }

    const manager = employees.find(e => e.role === 'shop_manager') || null
    const employeeIds = employees.map(e => e.id)

    // Get stats for this month
    const { data: sales } = await adminClient
      .from('sales')
      .select('category')
      .in('employee_id', employeeIds)
      .eq('year', targetYear)
      .eq('month', targetMonth)

    const wireless = sales?.filter((s: any) => s.category === 'Wireless').length || 0
    const wireline = sales?.filter((s: any) => s.category === 'Wireline').length || 0

    // Get Shop Manager YTD stats
    let ytdPercentage = 0
    let ytdBonus = 0

    if (manager) {
      const { data: target } = await adminClient
        .from('monthly_targets')
        .select('shop_manager_ytd_percentage')
        .eq('employee_id', manager.id)
        .eq('year', targetYear)
        .eq('month', targetMonth)
        .single()

      if (target) {
        ytdPercentage = (target as any).shop_manager_ytd_percentage || 0
        const percentageForBonus = Math.min(Math.max(ytdPercentage, 100), 200)
        const percentagePoints = percentageForBonus - 100
        ytdBonus = Math.max(0, percentagePoints * 50)
      }
    }

    return {
      ...shop,
      wireless,
      wireline,
      employees: employees.length,
      manager,
      ytdPercentage,
      ytdBonus
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
    year: targetYear,
    month: targetMonth
  }
}

export async function searchEmployees(query: string) {
  const adminClient = createAdminClient()

  // Search by name or email
  const { data: byName } = await adminClient
    .from('employees')
    .select('id, name, email, role, shop_id, shops(name)')
    .ilike('name', `%${query}%`)
    .limit(5)

  // If we want to search broadly we might need multiple queries or an 'or' filter
  // Supabase .or() syntax: .or(`name.ilike.%${query}%,email.ilike.%${query}%`)

  return byName || []
}

export async function createShopAndManager(data: {
  shopName: string,
  managerMode: 'new' | 'existing',
  managerData: {
    // For new
    name?: string,
    email?: string,
    password?: string,
    // For existing
    id?: string
  }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // 1. Get Region
  const { data: employeeData } = await adminClient
    .from('employees')
    .select('region_id')
    .eq('id', user.id)
    .single()

  const employee = employeeData as any
  if (!employee?.region_id) return { error: 'No region found' }

  // 2. Create Shop
  const { data: shop, error: shopError } = await (adminClient
    .from('shops') as any)
    .insert({
      name: data.shopName,
      region_id: employee.region_id
    })
    .select()
    .single()

  if (shopError) return { error: shopError.message }
  if (!shop) return { error: 'Failed to create shop' }

  // 3. Handle Manager
  if (data.managerMode === 'new') {
    const { name, email, password } = data.managerData
    if (!name || !email || !password) {
      return { error: 'Missing manager details' }
    }

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      // Cleanup shop if user creation fails
      await adminClient.from('shops').delete().eq('id', shop.id)
      return { error: `Failed to create user: ${authError.message}` }
    }

    // Update employee record
    const { error: updateError } = await (adminClient.from('employees') as any)
      .update({
        name,
        role: 'shop_manager',
        shop_id: shop.id,
        employment_percentage: 100
      })
      .eq('id', authData.user.id)

    if (updateError) {
      // Ideally clean up user too, but complex.
      return { error: 'User created but failed to assign to shop' }
    }

  } else {
    // Existing manager
    const { id } = data.managerData
    if (!id) return { error: 'No employee selected' }

    const { error: updateError } = await (adminClient.from('employees') as any)
      .update({
        role: 'shop_manager', // Always promote/ensure role
        shop_id: shop.id
      })
      .eq('id', id)

    if (updateError) return { error: updateError.message }
  }

  revalidatePath('/region')
  return { success: true }
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

export async function assignShopManager(params: {
  shopId: string
  employeeId: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Verify shop is in user's region (security check)
  const { data: requestingUser } = await adminClient.from('employees').select('region_id').eq('id', user.id).single()
  const requester = requestingUser as any

  const { data: shopData } = await adminClient.from('shops').select('region_id').eq('id', params.shopId).single()
  const shop = shopData as any

  if (!shop || shop.region_id !== requester?.region_id) {
    return { error: 'Unauthorized access to shop' }
  }

  // Update employee
  const { error } = await (adminClient.from('employees') as any)
    .update({
      role: 'shop_manager',
      shop_id: params.shopId
    })
    .eq('id', params.employeeId)

  if (error) return { error: error.message }

  revalidatePath('/region')
  return { success: true }
}
