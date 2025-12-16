import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeeStats } from './actions'
import { signOut } from '../login/actions'
import { DashboardView } from '@/components/dashboard-view'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const statsResult = await getEmployeeStats()

  if ('error' in statsResult || !statsResult.employee) {
    return <div>Error loading stats</div>
  }

  // Type assertion after error check
  const stats = statsResult as any

  return <DashboardView stats={stats} />
}
