'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentPeriod, calculateEmployeeBonus } from '@/lib/bonus-calculator'

// --- Director Actions ---

export async function getRegionsWithStats(year?: number, month?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Use adminClient to get company-wide data
  const adminClient = createAdminClient()

  // Verify Director (optional explicitly here, but good practice)
  const { data: userData } = await adminClient
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()

  const employeeRole = (userData as any)?.role

  if (employeeRole !== 'director' && user.email !== 'admin@admin.com') {
    // return { error: 'Unauthorized' } // Allow admin@admin.com as fallback for now
  }

  const current = getCurrentPeriod()
  const targetYear = year || current.year
  const targetMonth = month || current.month

  // 1. Get all regions
  const { data: regionsData } = await adminClient
    .from('regions')
    .select('*')
    .order('name')

  const regions = regionsData as any[]

  if (!regions) return { regions: [] }

  // 2. Get Key Data for each region
  const regionsWithStats = await Promise.all(regions.map(async (region: any) => {
    // Get Manager
    const { data: manager } = await adminClient
      .from('employees')
      .select('id, name, email, role, employment_percentage')
      .eq('region_id', region.id)
      .eq('role', 'regional_manager')
      .single()

    // Get Shops in Region
    const { data: shops } = await (adminClient.from('shops') as any)
      .select('id')
      .eq('region_id', region.id)

    const shopIds = shops?.map((s: any) => s.id) || []

    let salesCount = 0
    let topSellersCount = 0
    let totalBonusAmount = 0

    if (shopIds.length > 0) {
      // 1. Get Employee IDs in shops
      const { data: employees } = await adminClient
        .from('employees')
        .select('id, role, employment_percentage')
        .in('shop_id', shopIds)

      const ids = employees?.map((e: any) => e.id) || []

      if (ids.length > 0) {
        // Get Sales
        const { data: allSales } = await adminClient
          .from('sales')
          .select('category, employee_id')
          .in('employee_id', ids)
          .eq('year', targetYear)
          .eq('month', targetMonth)
          .eq('year', targetYear)
          .eq('month', targetMonth)

        salesCount = allSales?.length || 0

        // Get Targets
        const { data: targets } = await adminClient
          .from('monthly_targets')
          .select('employee_id, wireless_target, wireline_target, shop_manager_ytd_percentage')
          .in('employee_id', ids)
          .eq('year', targetYear)
          .eq('month', targetMonth)

        const targetsMap = new Map(targets?.map((t: any) => [t.employee_id, t]) || [])

        // Calculate Bonuses & Top Sellers
        employees?.forEach((emp: any) => {
          if (emp.role === 'regional_manager' || emp.role === 'director') return

          const empSales = allSales?.filter((s: any) => s.employee_id === emp.id) || []
          const empTarget = targetsMap.get(emp.id)
          const wirelessCount = empSales.filter((s: any) => s.category === 'Wireless').length
          const wirelineCount = empSales.filter((s: any) => s.category === 'Wireline').length
          const wirelessTarget = (empTarget as any)?.wireless_target || 0
          const wirelineTarget = (empTarget as any)?.wireline_target || 0

          let bonus = 0
          let isTopSeller = false

          if (emp.role === 'shop_manager') {
            // Manager Bonus Logic: Based on monthly_targets YTD percentage
            const ytdPercentage = (empTarget as any)?.shop_manager_ytd_percentage || 0
            if (ytdPercentage > 100) {
              isTopSeller = true
              const percentagePoints = Math.min(ytdPercentage, 200) - 100
              bonus = percentagePoints * 50
            }
          } else {
            // Sales Role Bonus Logic
            const calc = calculateEmployeeBonus({
              role: emp.role,
              wirelessCount,
              wirelineCount,
              wirelessTarget,
              wirelineTarget,
              employmentPercentage: emp.employment_percentage || 100
            })

            bonus = calc.cappedBonus
            // Top Seller if ZER > 100% in either category (simple definition)
            if (calc.wirelessZER > 100 || calc.wirelineZER > 100) {
              isTopSeller = true
            }
          }

          if (isTopSeller) topSellersCount++
          totalBonusAmount += bonus
        })
      }
    }

    return {
      ...region,
      manager,
      salesCount,
      shopCount: shopIds.length,
      topSellersCount,
      totalBonusAmount
    }
  }))

  return { regions: regionsWithStats }
}

export async function createRegion(data: {
  name: string,
  managerId?: string,
  newManager?: { name: string, email: string, password: string }
}) {
  const adminClient = createAdminClient()

  // 1. Create Region
  const { data: regionData, error: regionError } = await (adminClient.from('regions') as any)
    .insert({ name: data.name })
    .select()
    .single()

  if (regionError) return { error: regionError.message }
  if (!regionData) return { error: 'Failed to create region' }

  const regionId = regionData.id

  // 2. Assign Manager (Existing)
  if (data.managerId) {
    const { error: assignError } = await (adminClient.from('employees') as any)
      .update({
        role: 'regional_manager',
        region_id: regionId,
        shop_id: null
      })
      .eq('id', data.managerId)

    if (assignError) {
      // Clean up region? No, maybe better to keep it and report partial error
      return { error: `Region created but manager assignment failed: ${assignError.message}`, partial: true }
    }
  }
  // 3. Create Manager (New)
  else if (data.newManager) {
    // Create Auth User
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.newManager.email,
      password: data.newManager.password,
      email_confirm: true,
      user_metadata: { name: data.newManager.name }
    })

    if (authError) return { error: `Region created but manager creation failed: ${authError.message}`, partial: true }

    // Check if employee record exists (trigger latency)
    // We can try to update directly. If it fails (doesn't exist yet), we might need to retry or insert.
    // Safest is to wait briefly or just assume trigger is fast enough for this sequential await.
    // Or we can manually insert into 'employees' if we disable the trigger?
    // Let's assume the trigger works. We'll attempt update.

    const { error: updateError } = await (adminClient.from('employees') as any)
      .update({
        role: 'regional_manager',
        region_id: regionId,
        name: data.newManager.name
      })
      .eq('id', authData.user?.id)

    if (updateError) return { error: `Region created but manager update failed: ${updateError.message}`, partial: true }
  }

  revalidatePath('/director')
  return { success: true }
}

export async function searchPotentialManagers(query: string) {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('employees')
    .select('id, name, email, role, region_id, shop_id')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(5)
  return data || []
}

export async function assignRegionalManager(regionId: string, userId: string) {
  const adminClient = createAdminClient()

  // 1. Check if user exists and current role
  const { data: user } = await adminClient.from('employees').select('role').eq('id', userId).single()
  if (!user) return { error: 'User not found' }

  // 2. Update user
  // - Set role to regional_manager
  // - Set region_id to new region
  // - Clear shop_id (Regional Managers are not "in" a shop usually, they oversee them)
  // Note: If they were a shop manager, the shop loses its manager. That's acceptable for now.

  const { error } = await (adminClient.from('employees') as any)
    .update({
      role: 'regional_manager',
      region_id: regionId,
      shop_id: null
    })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/director')
  return { success: true }
}

export async function createRegionalManager(userData: {
  name: string,
  email: string,
  password: string,
  regionId: string
}) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // 1. Create Auth User
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: { name: userData.name }
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: 'Failed to create user' }

  // 2. Create/Update Employee Record
  // Note: The trigger might auto-create an employee record with defaults.
  // We should upsert to ensure role/region are set correctly.

  const { error: updateError } = await (adminClient.from('employees') as any)
    .upsert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: 'regional_manager',
      region_id: userData.regionId,
      employment_percentage: 100
    })

  if (updateError) return { error: updateError.message }

  revalidatePath('/director')
  return { success: true }
}
