import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboard } from './actions'
import { signOut } from '../login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Trophy, ArrowLeft } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'

export default async function ListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getLeaderboard()

  if ('error' in result || !result.leaderboard) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Error loading leaderboard</div>
  }

  const { leaderboard } = result

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.email !== 'list@admin.com' && (
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <div>
              <p className="text-white/90 text-sm font-medium">Leaderboard</p>
              <p className="text-white/50 text-xs">Employee Rankings</p>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8 pb-20">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-yellow-500/20 mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Top Performers</h1>
          <p className="text-white/60">See who's leading the sales charts</p>
        </div>

        <div className="space-y-4">
          {leaderboard.map((employee, index) => {
            const isCurrentUser = employee.id === user.id
            const IconComponent = employee.currentTier ? (Icons as any)[employee.currentTier.icon] : Icons.Star

            return (
              <div
                key={employee.id}
                className={`relative overflow-hidden rounded-2xl border p-4 transition-all
                  ${isCurrentUser
                    ? 'bg-white/15 border-white/30 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-none w-8 text-center">
                    <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-400' : 'text-white/40'}`}>
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${isCurrentUser ? 'text-white' : 'text-white/90'}`}>
                        {employee.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-medium uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      {employee.currentTier && (
                        <div className="flex items-center gap-1" style={{ color: employee.currentTier.color }}>
                          <IconComponent className="h-3 w-3" />
                          <span>{employee.currentTier.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-indigo-300">{employee.internetSales}</div>
                      <div className="text-[10px] text-white/40 uppercase">Net</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-purple-300">{employee.mobileSales}</div>
                      <div className="text-[10px] text-white/40 uppercase">Mob</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{employee.totalSales}</div>
                      <div className="text-xs text-white/50">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-white/40">
              No employees found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
