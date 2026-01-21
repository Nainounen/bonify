'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

// --- Shop Manager Actions ---

export async function getShopEmployees(year?: number, month?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const current = getCurrentPeriod()
  const targetYear = year || current.year
  const targetMonth = month || current.month

  // Use adminClient to bypass RLS recursion and permissions issues
  const adminClient = createAdminClient()

  // Get manager's shop_id
  const { data: managerData } = await adminClient
    .from('employees')
    .select('shop_id')
    .eq('id', user.id)
    .single()

  const manager = managerData as any

  if (!manager?.shop_id) return { error: 'No shop assigned' }

  // Get employees in this shop
  const { data: employees } = await adminClient
    .from('employees')
    .select('*, sales(id, category, created_at, year, month)')
    .eq('shop_id', manager.shop_id)
    .eq('sales.year', targetYear)
    .eq('sales.month', targetMonth)
    .order('name')

  return { employees: employees || [] }
}

export async function createShopEmployee(params: {
  name: string
  email: string
  password: string
  role: 'internal_sales' | 'external_sales'
  employmentPercentage: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Verify requesting user is a manager and get shop_id
  const { data: managerData } = await adminClient
    .from('employees')
    .select('shop_id, role')
    .eq('id', user.id)
    .single()

  const manager = managerData as any

  if (manager?.role !== 'shop_manager' || !manager.shop_id) {
    return { error: 'Unauthorized' }
  }

  // Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      name: params.name,
    },
  })

  if (authError) return { error: authError.message }

  // Update employee record
  const { error: updateError } = await (adminClient
    .from('employees') as any)
    .update({
      name: params.name,
      role: params.role,
      employment_percentage: params.employmentPercentage,
      shop_id: manager.shop_id,
    })
    .eq('id', authData.user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function addExistingShopEmployee(targetUserId: string, role: string = 'internal_sales', employmentPercentage: number = 100) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Get manager's shop
  const { data: managerData } = await adminClient
    .from('employees')
    .select('shop_id, role')
    .eq('id', user.id)
    .single()

  const manager = managerData as any

  if (!manager || manager.role !== 'shop_manager' || !manager.shop_id) {
    return { error: 'Unauthorized' }
  }

  // Update target employee
  const { error } = await (adminClient.from('employees') as any)
    .update({
      shop_id: manager.shop_id,
      role: role,
      employment_percentage: employmentPercentage
    })
    .eq('id', targetUserId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function searchEmployees(query: string) {
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('employees')
    .select('id, name, email, role, shop_id, shops(name)')
    .ilike('name', `%${query}%`)
    .limit(5)

  return data || []
}

export async function updateShopEmployee(params: {
  id: string
  role: string
  employmentPercentage: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Verify manager
  const { data: managerData } = await adminClient
    .from('employees')
    .select('shop_id, role')
    .eq('id', user.id)
    .single()

  const manager = managerData as any

  if (!manager || manager.role !== 'shop_manager' || !manager.shop_id) {
    return { error: 'Unauthorized' }
  }

  // Verify target employee belongs to this shop
  const { data: targetEmpData } = await adminClient
    .from('employees')
    .select('shop_id')
    .eq('id', params.id)
    .single()

  const targetEmp = targetEmpData as any

  if (targetEmp?.shop_id !== manager.shop_id) {
    return { error: 'Employee not in your shop' }
  }

  const { error } = await (adminClient.from('employees') as any)
    .update({
      role: params.role,
      employment_percentage: params.employmentPercentage
    })
    .eq('id', params.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteShopEmployee(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Verify requesting user is a manager and get shop_id
  const { data: managerData } = await adminClient
    .from('employees')
    .select('shop_id, role')
    .eq('id', user.id)
    .single()

  const manager = managerData as any

  if (manager?.role !== 'shop_manager' || !manager.shop_id) {
    return { error: 'Unauthorized' }
  }

  // Verify target user belongs to same shop
  const { data: targetUserData } = await adminClient
    .from('employees')
    .select('shop_id')
    .eq('id', targetUserId)
    .single()

  const targetUser = targetUserData as any

  if (targetUser?.shop_id !== manager.shop_id) {
    return { error: 'Unauthorized: Employee not in your shop' }
  }

  // Delete sales first
  await adminClient.from('sales').delete().eq('employee_id', targetUserId)

  // Delete employee record
  await adminClient.from('employees').delete().eq('id', targetUserId)

  // Delete auth user
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function setShopEmployeeTarget(params: {
  employeeId: string
  wirelessTarget: number
  wirelineTarget: number
  shopManagerYtdPercentage?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Verify manager
  const { data: managerData } = await adminClient
    .from('employees')
    .select('shop_id, role')
    .eq('id', user.id)
    .single()

  const manager = managerData as any

  if (manager?.role !== 'shop_manager') return { error: 'Unauthorized' }

  // Verify target user belongs to same shop
  const { data: targetUserData } = await adminClient
    .from('employees')
    .select('shop_id, role')
    .eq('id', params.employeeId)
    .single()

  const targetUser = targetUserData as any

  if (targetUser?.shop_id !== manager.shop_id) {
    return { error: 'Employee not in your shop' }
  }

  const { year, month } = getCurrentPeriod()

  const payload: any = {
    employee_id: params.employeeId,
    year,
    month,
    wireless_target: params.wirelessTarget,
    wireline_target: params.wirelineTarget
  }

  // Only allow setting YTD percentage if the target user is a shop manager
  if (targetUser.role === 'shop_manager' && params.shopManagerYtdPercentage !== undefined) {
    payload.shop_manager_ytd_percentage = params.shopManagerYtdPercentage
  }

  // Upsert target
  const { error } = await (adminClient
    .from('monthly_targets') as any)
    .upsert(payload, { onConflict: 'employee_id, year, month' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getShopTargets(year?: number, month?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { targets: [] }

  const adminClient = createAdminClient()

  const { data: managerData } = await adminClient.from('employees').select('shop_id').eq('id', user.id).single()
  const manager = managerData as any

  if (!manager?.shop_id) return { targets: [] }

  const current = getCurrentPeriod()
  const targetYear = year || current.year
  const targetMonth = month || current.month

  // Get employees ids first
  const { data: employeesData } = await adminClient.from('employees').select('id').eq('shop_id', manager.shop_id)
  const employees = employeesData as any[]
  const ids = employees?.map(e => e.id) || []

  if (ids.length === 0) return { targets: [] }

  const { data: targets } = await adminClient.from('monthly_targets')
    .select('*')
    .in('employee_id', ids)
    .eq('year', targetYear)
    .eq('month', targetMonth)

  return { targets: targets || [] }
}