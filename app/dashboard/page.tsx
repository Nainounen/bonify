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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm font-medium">{stats.employee!.name}</p>
            <p className="text-white/50 text-xs">{stats.currentTier?.name || 'Starter'} Tier</p>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 pb-20">
        <DashboardView stats={stats} />
      </div>
    </div>
  )
}
