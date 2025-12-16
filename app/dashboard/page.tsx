import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployeeStats } from './actions'
import { signOut } from '../login/actions'
import { CounterButton } from '@/components/counter-button'
import { TierBadge } from '@/components/tier-badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { LogOut, TrendingUp, DollarSign, Target, Zap } from 'lucide-react'
import * as Icons from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getEmployeeStats()

  if (stats.error || !stats.employee) {
    return <div>Error loading stats</div>
  }

  const progressToNext = stats.nextTier
    ? ((stats.totalSales - (stats.currentTier?.contracts_required || 0)) /
        (stats.nextTier.contracts_required - (stats.currentTier?.contracts_required || 0))) *
      100
    : 100

  return (
    <div className="min-h-screen bg-[#040d33]">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-[#001155] border-b border-[#0445c8]/30">
        <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-white text-base font-semibold">{stats.employee.name}</p>
            <p className="text-[#11aaff] text-sm">{stats.currentTier?.name || 'Starter'} Level</p>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 pb-20">

        {/* Stats Overview */}
        <div className="py-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#001155] rounded-xl p-4 border border-[#0445c8]/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-[#11aaff]" />
                <p className="text-[#11aaff] text-xs font-medium uppercase tracking-wide">Contracts</p>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalSales}</div>
            </div>
            
            <div className="bg-[#001155] rounded-xl p-4 border border-[#0445c8]/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-[#00a3bf]" />
                <p className="text-[#00a3bf] text-xs font-medium uppercase tracking-wide">Earned</p>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalBonus.toFixed(0)}</div>
              <p className="text-white/50 text-xs mt-1">CHF</p>
            </div>
            
            <div className="bg-[#001155] rounded-xl p-4 border border-[#0445c8]/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[#0e6eec]" />
                <p className="text-[#0e6eec] text-xs font-medium uppercase tracking-wide">Remaining</p>
              </div>
              <div className="text-3xl font-bold text-white">{stats.nextTier ? stats.nextTier.contracts_required - stats.totalSales : 0}</div>
            </div>
          </div>
        </div>

        {/* Counter Button */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-[#001155] rounded-2xl p-8 w-full max-w-md border border-[#0445c8]/30">
            <h2 className="text-white text-lg font-semibold mb-2 text-center">Log New Contract</h2>
            <p className="text-white/60 text-sm mb-6 text-center">Press the button to record a sale</p>
            <div className="flex justify-center">
              <CounterButton />
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {stats.nextTier && (
          <div className="mb-8 bg-[#001155] rounded-2xl p-6 border border-[#0445c8]/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#11aaff] text-xs font-medium uppercase tracking-wide mb-2">Next Level</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = (Icons as any)[stats.nextTier.icon] || Icons.Star
                    return <IconComponent className="h-5 w-5 text-[#0e6eec]" />
                  })()}
                  <span className="text-white font-semibold text-xl">{stats.nextTier.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{stats.nextTier.contracts_required - stats.totalSales}</div>
                <p className="text-white/50 text-sm">to unlock</p>
              </div>
            </div>
            <Progress value={progressToNext} className="h-3 mb-4" />
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">{stats.totalSales} / {stats.nextTier.contracts_required} contracts</span>
              <span className="text-[#00a3bf] font-semibold text-lg">CHF {stats.nextTier.bonus_amount}</span>
            </div>
          </div>
        )}

        {/* Bonus Levels */}
        <div className="mb-8">
          <h3 className="text-white font-semibold text-xl mb-6">Performance Levels</h3>
          <div className="space-y-3">
            {stats.tiers.map((tier, index) => {
              const isUnlocked = stats.totalSales >= tier.contracts_required
              const isCurrent = stats.currentTier?.id === tier.id
              const IconComponent = (Icons as any)[tier.icon] || Icons.Star
              
              return (
                <div 
                  key={tier.id}
                  className={`relative p-5 rounded-xl transition-all border ${
                    isCurrent
                      ? 'bg-[#001155] border-[#0e6eec] border-2' 
                      : isUnlocked
                      ? 'bg-[#001155] border-[#0445c8]/50'
                      : 'bg-[#001155]/50 border-[#0445c8]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className={`flex items-center justify-center w-14 h-14 rounded-lg ${
                          isUnlocked ? 'bg-[#0445c8]/30' : 'bg-[#040d33]'
                        }`}
                      >
                        <IconComponent 
                          className="h-7 w-7" 
                          style={{ color: isUnlocked ? '#11aaff' : '#ffffff30' }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-lg ${
                            isUnlocked ? 'text-white' : 'text-white/40'
                          }`}>{tier.name}</h4>
                          {isCurrent && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#0e6eec] text-white rounded">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isUnlocked ? 'text-[#11aaff]' : 'text-white/30'
                        }`}>
                          {tier.contracts_required} contracts required
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        isUnlocked ? 'text-[#00a3bf]' : 'text-white/30'
                      }`}>
                        CHF {tier.bonus_amount}
                      </div>
                      {isUnlocked ? (
                        <span className="text-xs text-[#00a3bf] font-medium">✓ ACHIEVED</span>
                      ) : (
                        <span className="text-xs text-white/30 font-medium">LOCKED</span>
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
