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

export async function getLeaderboard(
  year?: number,
  month?: number,
  filterType: 'my_shop' | 'region' | 'specific_shop' = 'my_shop',
  shopFilterId?: string
) {
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
  const { data: employeeData } = await adminClient
    .from('employees')
    .select('*, shops(name, region_id)')
    .eq('id', user.id)
    .single()

  const currentUserEmployee = employeeData as any
  const userRole = currentUserEmployee?.role || 'internal_sales'
  const isPrivileged = ['regional_manager', 'director'].includes(userRole)
  const isAdmin = user.email === 'admin@admin.com'

  // Determine filtering contexts
  const userShopId = currentUserEmployee?.shop_id
  const userRegionId = currentUserEmployee?.region_id || currentUserEmployee?.shops?.region_id

  // Prepare context for UI
  let availableShops: { id: string, name: string }[] = []

  if (isPrivileged || isAdmin) {
    if (userRegionId) {
      // Fetch shops in region for dropdown
      const { data: shops } = await adminClient
        .from('shops')
        .select('id, name')
        .eq('region_id', userRegionId)
        .order('name')
      availableShops = shops as any[] || []
    } else {
      // Fallback for admins or unassigned directors: fetch all shops
      const { data: shops } = await adminClient
        .from('shops')
        .select('id, name')
        .order('name')
      availableShops = shops as any[] || []
    }
  }

  let query = adminClient
    .from('employees')
    .select('*')
    .neq('email', 'list@admin.com')
    .neq('email', 'admin@admin.com')

  // -- FILTER LOGIC --

  if (isAdmin) {
    // Admin follows similar logic to privileged users or sees all if no filter
    if (filterType === 'specific_shop' && shopFilterId) {
      query = query.eq('shop_id', shopFilterId)
    } else if (filterType === 'region' && userRegionId) {
      // Should filter by region if admin had a region context, but admin usually sees all.
      // For now, let's say admin sees global unless specific shop selected.
    }
  } else if (isPrivileged) {
    // Regional Manager / Director
    if (filterType === 'specific_shop' && shopFilterId) {
      // Validate shop belongs to region (optional security check, but good practice)
      // For simplicity, just filter by shop_id
      query = query.eq('shop_id', shopFilterId)
    } else if (filterType === 'region') {
      // See all employees in the region
      // We need employees whose shop is in the region OR who are assigned to the region
      if (userRegionId) {
        // Get shops in region first to filter employees by shop_id (more efficient for RLS usually)
        // OR use the database relationship

        // employees -> shop -> region_id = X  OR employees -> region_id = X
        // Supabase Filter: We need to filter based on joined table or subquery logic.
        // Since simple .eq() won't work for OR condition across tables easily with simple query builder:

        // Approach: Get list of Shop IDs in region + Region ID itself
        const { data: regionShops } = await adminClient.from('shops').select('id').eq('region_id', userRegionId)
        const shopIds = regionShops?.map((s: any) => s.id) || []

        // Employees in these shops OR the region itself
        // .or(`shop_id.in.(${shopIds.join(',')}),region_id.eq.${userRegionId}`)
        // Syntax for 'in' with OR is tricky.

        // Simpler: Filter by shop_id IN [...ids] (most emps) and maybe fetch direct region emps separately if needed?
        // Actually, `query` builder is single table.

        // Let's use the explicit list of shop IDs.
        if (shopIds.length > 0) {
          // We want employees in these shops OR direct region assignment
          // .or(`shop_id.in.(${shopIds.join(',')}),region_id.eq.${userRegionId}`)
          // Note: array format for .in() inside .or() string is `(a,b,c)`

          const shopIdStr = `(${shopIds.join(',')})`
          query = query.or(`shop_id.in.${shopIdStr},region_id.eq.${userRegionId}`)
        } else {
          query = query.eq('region_id', userRegionId)
        }
      }
    } else {
      // Default view for Manager? Maybe "My Shop" if they have one, or "Region"?
      // Let's assume default is Region for Managers usually.
      // But if filterType is 'my_shop', show their shop
      if (filterType === 'my_shop' && userShopId) {
        query = query.eq('shop_id', userShopId)
      } else if (userRegionId) {
        // Fallback to region view
        const { data: regionShops } = await adminClient.from('shops').select('id').eq('region_id', userRegionId)
        const shopIds = regionShops?.map((s: any) => s.id) || []
        if (shopIds.length > 0) {
          const shopIdStr = `(${shopIds.join(',')})`
          query = query.or(`shop_id.in.${shopIdStr},region_id.eq.${userRegionId}`)
        } else {
          query = query.eq('region_id', userRegionId)
        }
      }
    }

  } else {
    // -- Regular Employee / Shop Manager --
    // Option 1: Own Shop (default)
    // Option 2: Own Region

    if (filterType === 'region' && userRegionId) {
      // See all employees in their region
      const { data: regionShops } = await adminClient.from('shops').select('id').eq('region_id', userRegionId)
      const shopIds = regionShops?.map((s: any) => s.id) || []
      if (shopIds.length > 0) {
        const shopIdStr = `(${shopIds.join(',')})`
        query = query.or(`shop_id.in.${shopIdStr},region_id.eq.${userRegionId}`)
      } else {
        query = query.eq('region_id', userRegionId)
      }
    } else {
      // Default: My Shop
      if (userShopId) {
        query = query.eq('shop_id', userShopId)
      } else {
        query = query.eq('id', user.id) // Fallback
      }
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

  return {
    leaderboard,
    userContext: {
      role: userRole,
      regionId: userRegionId,
      shopId: userShopId,
      availableShops,
      currentFilter: filterType,
      currentShopFilter: shopFilterId
    }
  }
}
