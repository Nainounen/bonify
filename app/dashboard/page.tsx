import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeeStats } from './actions'
import { DashboardView } from '@/components/dashboard-view'

export default async function DashboardPage() {
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

  const statsResult = await getEmployeeStats()

  if ('error' in statsResult || !statsResult.employee) {
    return <div>Error loading stats</div>
  }

  // Type assertion after error check
  const stats = statsResult as any

  return <DashboardView stats={stats} />
}
