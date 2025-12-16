'use client'

import { useState } from 'react'
import { CounterButton } from '@/components/counter-button'
import { Progress } from '@/components/ui/progress'
import * as Icons from 'lucide-react'
import { Zap } from 'lucide-react'

type DashboardViewProps = {
  stats: any // Using any for now to match existing loose typing, but ideally should be typed
}

export function DashboardView({ stats }: DashboardViewProps) {
  const [category, setCategory] = useState<'Internet' | 'Mobile'>('Internet')

  // Filter sales based on category
  const filteredSales = stats.sales.filter((s: any) => s.category === category)
  const filteredTotalSales = filteredSales.length

  // Calculate tier based on filtered sales
  // Assuming same tier thresholds apply to each category individually
  const currentTier = stats.tiers
    .filter((t: any) => t.contracts_required <= filteredTotalSales)
    .sort((a: any, b: any) => b.contracts_required - a.contracts_required)[0]

  const nextTier = stats.tiers.find((t: any) => t.contracts_required > filteredTotalSales)

  const progressToNext = nextTier
    ? ((filteredTotalSales - (currentTier?.contracts_required || 0)) /
      (nextTier.contracts_required - (currentTier?.contracts_required || 0))) *
    100
    : 100

  const internetSales = stats.sales.filter((s: any) => s.category === 'Internet').length
  const mobileSales = stats.sales.filter((s: any) => s.category === 'Mobile').length

  return (
    <>
      {/* Hero Stats Section */}
      <div className="py-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-white/90">{stats.totalSales} Total Contracts Sold</span>
        </div>

        <div className="mb-6">
          <div className="text-7xl font-bold text-white mb-2">{filteredTotalSales}</div>
          <p className="text-white/60 text-sm uppercase tracking-wider">{category} Sales</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
          <div className={`rounded-2xl p-3 border transition-all ${category === 'Internet' ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/10'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1 text-indigo-300">
              <Icons.Wifi className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Internet</span>
            </div>
            <div className="text-xl font-bold text-white">{internetSales}</div>
          </div>
          <div className={`rounded-2xl p-3 border transition-all ${category === 'Mobile' ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/5 border-white/10'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1 text-purple-300">
              <Icons.Smartphone className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Mobile</span>
            </div>
            <div className="text-xl font-bold text-white">{mobileSales}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">CHF {stats.totalBonus.toFixed(0)}</div>
            <p className="text-white/50 text-xs uppercase tracking-wide mt-1">Total Earned</p>
          </div>
          <div className="h-12 w-px bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{nextTier ? nextTier.contracts_required - filteredTotalSales : 0}</div>
            <p className="text-white/50 text-xs uppercase tracking-wide mt-1">To Next {category} Tier</p>
          </div>
        </div>
      </div>

      {/* Counter Button - Prominent */}
      <div className="flex flex-col items-center justify-center mb-12">
        <p className="text-white/70 text-sm mb-6 uppercase tracking-wider">Tap to Log Sale</p>
        <CounterButton
          category={category}
          onCategoryChange={setCategory}
        />
      </div>

      {/* Progress to Next Tier */}
      {nextTier && (
        <div className="mb-12 p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Next {category} Tier</p>
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = (Icons as any)[nextTier.icon] || Icons.Star
                  return <IconComponent className="h-5 w-5" style={{ color: nextTier.color }} />
                })()}
                <span className="text-white font-semibold text-lg">{nextTier.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{nextTier.contracts_required - filteredTotalSales}</div>
              <p className="text-white/50 text-xs">remaining</p>
            </div>
          </div>
          <Progress value={progressToNext} className="h-2 mb-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">{filteredTotalSales} / {nextTier.contracts_required}</span>
            <span className="text-emerald-400 font-semibold">+CHF {nextTier.bonus_amount}</span>
          </div>
        </div>
      )}

      {/* All Tiers - Visual Timeline */}
      <div className="mb-8">
        <h3 className="text-white/90 font-semibold text-lg mb-6 text-center">{category} Bonus Journey</h3>
        <div className="space-y-3">
          {stats.tiers.map((tier: any, index: number) => {
            const isUnlocked = filteredTotalSales >= tier.contracts_required
            const isCurrent = currentTier?.id === tier.id
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
                    <div className="text-xs text-white/30">Bonus</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
