import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeeStats } from './actions'
import { getShopEmployees, getShopTargets } from './shop-manager-actions'
import { DashboardView } from '@/components/dashboard-view'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect admin to admin page
  if (user.email === 'admin@admin.com') {
    redirect('/admin')
  }

  // Redirect list-only user to list page
  if (user.email === 'list@admin.com') {
    redirect('/list')
  }

  const { year, month } = await searchParams
  const y = year ? parseInt(year as string) : undefined
  const m = month ? parseInt(month as string) : undefined

  const statsResult = await getEmployeeStats(y, m)

  if ('error' in statsResult || !statsResult.employee) {
    return <div>Error loading stats</div>
  }

  // Type assertion after error check
  const stats = statsResult as any

  // Check for Regional Manager redirect
  if (stats.employee.role === 'regional_manager') {
    redirect('/region')
  }

  // Check for Director redirect
  if (stats.employee.role === 'director') {
    redirect('/director')
  }

  // Get shop management data if user is a shop manager
  let shopData = null
  if (stats.employee.role === 'shop_manager') {
    const [employeesResult, targetsResult] = await Promise.all([
      getShopEmployees(y, m),
      getShopTargets(y, m)
    ])

    shopData = {
      employees: 'employees' in employeesResult ? (employeesResult.employees as any[]) : [],
      targets: 'targets' in targetsResult ? (targetsResult.targets as any[]) : []
    }
  }

  return <DashboardView stats={stats} shopData={shopData} />
}
