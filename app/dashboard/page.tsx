import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeeStats } from './actions'
import { signOut } from '../login/actions'
import { CounterButton } from '@/components/counter-button'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { LogOut, Zap } from 'lucide-react'
import * as Icons from 'lucide-react'

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

  const progressToNext = stats.nextTier
    ? ((stats.totalSales - (stats.currentTier?.contracts_required || 0)) /
      (stats.nextTier.contracts_required - (stats.currentTier?.contracts_required || 0))) *
    100
    : 100

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

        {/* Hero Stats Section */}
        <div className="py-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">{stats.totalSales} Contracts Sold</span>
          </div>

          <div className="mb-6">
            <div className="text-7xl font-bold text-white mb-2">{stats.totalSales}</div>
            <p className="text-white/60 text-sm uppercase tracking-wider">Total Sales</p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">CHF {stats.totalBonus.toFixed(0)}</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mt-1">Earned</p>
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.nextTier ? stats.nextTier.contracts_required - stats.totalSales : 0}</div>
              <p className="text-white/50 text-xs uppercase tracking-wide mt-1">To Next</p>
            </div>
          </div>
        </div>

        {/* Counter Button - Prominent */}
        <div className="flex flex-col items-center justify-center mb-12">
          <p className="text-white/70 text-sm mb-6 uppercase tracking-wider">Tap to Log Sale</p>
          <CounterButton />
        </div>

        {/* Progress to Next Tier */}
        {stats.nextTier && (
          <div className="mb-12 p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Next Tier</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = (Icons as any)[stats.nextTier.icon] || Icons.Star
                    return <IconComponent className="h-5 w-5" style={{ color: stats.nextTier.color }} />
                  })()}
                  <span className="text-white font-semibold text-lg">{stats.nextTier.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.nextTier.contracts_required - stats.totalSales}</div>
                <p className="text-white/50 text-xs">remaining</p>
              </div>
            </div>
            <Progress value={progressToNext} className="h-2 mb-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">{stats.totalSales} / {stats.nextTier.contracts_required}</span>
              <span className="text-emerald-400 font-semibold">+CHF {stats.nextTier.bonus_amount}</span>
            </div>
          </div>
        )}

        {/* All Tiers - Visual Timeline */}
        <div className="mb-8">
          <h3 className="text-white/90 font-semibold text-lg mb-6 text-center">Bonus Journey</h3>
          <div className="space-y-3">
            {stats.tiers.map((tier: any, index: number) => {
              const isUnlocked = stats.totalSales >= tier.contracts_required
              const isCurrent = stats.currentTier?.id === tier.id
              const IconComponent = (Icons as any)[tier.icon] || Icons.Star

              return (
                <div
                  key={tier.id}
                  className={`relative p-4 rounded-2xl transition-all ${isUnlocked
                      ? 'bg-gradient-to-r from-white/15 to-white/5 border-2'
                      : 'bg-white/5 border'
                    } border-white/20 ${isCurrent ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-purple-900' : ''
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl ${isUnlocked ? 'bg-white/20' : 'bg-white/5'
                          }`}
                        style={{ backgroundColor: isUnlocked ? `${tier.color}30` : undefined }}
                      >
                        <IconComponent
                          className="h-6 w-6"
                          style={{ color: isUnlocked ? tier.color : '#ffffff50' }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-white/40'
                            }`}>{tier.name}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isUnlocked ? 'text-white/60' : 'text-white/30'
                          }`}>
                          {tier.contracts_required} contracts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isUnlocked ? 'text-emerald-400' : 'text-white/30'
                        }`}>
                        CHF {tier.bonus_amount}
                      </div>
                      {isUnlocked ? (
                        <span className="text-xs text-emerald-400">✓ Unlocked</span>
                      ) : (
                        <span className="text-xs text-white/30">Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
