'use client'

import { useState } from 'react'
import { CounterButton } from '@/components/counter-button'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import * as Icons from 'lucide-react'
import { Zap, LogOut } from 'lucide-react'
import { themes } from '@/lib/themes'
import { signOut } from '@/app/login/actions'
import { Palette } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DashboardViewProps = {
  stats: any
}

export function DashboardView({ stats }: DashboardViewProps) {
  const [category, setCategory] = useState<'Internet' | 'Mobile'>('Internet')
  const [currentThemeId, setCurrentThemeId] = useState('default')

  const globalTheme = themes[currentThemeId]
  const theme = globalTheme.variants[category]

  // Filter sales based on category
  const filteredSales = stats.sales.filter((s: any) => s.category === category)
  const filteredTotalSales = filteredSales.length

  // Calculate tier based on filtered sales
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
    <div className={`min-h-screen transition-colors duration-700 ${theme.background}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 border-b ${theme.navBar} ${theme.navBarBorder}`}>
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className={`${theme.text.primary} text-sm font-medium`}>{stats.employee!.name}</p>
            <p className={`${theme.text.secondary} text-xs`}>{currentTier?.name || 'Starter'} Tier</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10`}>
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-white">
                {Object.values(themes).map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setCurrentThemeId(t.id)}
                    className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.variants.Internet.accent.replace('bg-', 'from-').replace('text-', 'from-')} to-slate-900`} />
                      <span className={currentThemeId === t.id ? 'font-bold text-white' : 'text-white/70'}>
                        {t.name}
                      </span>
                      {currentThemeId === t.id && <Icons.Check className="h-3 w-3 ml-auto" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <form action={signOut}>
              <Button variant="ghost" size="sm" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10`}>
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 pb-20">
        {/* Hero Stats Section */}
        <div className="py-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm mb-6 ${theme.glass}`}>
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className={`text-sm font-medium ${theme.text.primary}`}>{stats.totalSales} Total Contracts Sold</span>
          </div>

          <div className="mb-6">
            <div className={`text-7xl font-bold ${theme.text.primary} mb-2 transition-colors duration-500`}>{filteredTotalSales}</div>
            <p className={`${theme.text.secondary} text-sm uppercase tracking-wider transition-colors duration-500`}>{category} Sales</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
            <div className={`rounded-2xl p-3 border transition-all duration-500 ${category === 'Internet' ? `${theme.card} ${theme.cardBorder}` : `${theme.cardInactive} ${theme.cardInactiveBorder}`
              }`}>
              <div className={`flex items-center justify-center gap-2 mb-1 ${theme.secondary}`}>
                <Icons.Wifi className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">Internet</span>
              </div>
              <div className={`text-xl font-bold ${theme.text.primary}`}>{internetSales}</div>
            </div>
            <div className={`rounded-2xl p-3 border transition-all duration-500 ${category === 'Mobile' ? `${theme.card} ${theme.cardBorder}` : `${theme.cardInactive} ${theme.cardInactiveBorder}`
              }`}>
              <div className={`flex items-center justify-center gap-2 mb-1 ${theme.secondary}`}>
                <Icons.Smartphone className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">Mobile</span>
              </div>
              <div className={`text-xl font-bold ${theme.text.primary}`}>{mobileSales}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">CHF {stats.totalBonus.toFixed(0)}</div>
              <p className={`${theme.text.muted} text-xs uppercase tracking-wide mt-1`}>Total Earned</p>
            </div>
            <div className={`h-12 w-px ${theme.divider}`}></div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme.primary} transition-colors duration-500`}>{nextTier ? nextTier.contracts_required - filteredTotalSales : 0}</div>
              <p className={`${theme.text.muted} text-xs uppercase tracking-wide mt-1`}>To Next {category} Tier</p>
            </div>
          </div>
        </div>

        {/* Counter Button - Prominent */}
        <div className="flex flex-col items-center justify-center mb-12">
          <p className={`${theme.text.muted} text-sm mb-6 uppercase tracking-wider`}>Tap to Log Sale</p>
          <CounterButton
            category={category}
            onCategoryChange={setCategory}
            theme={globalTheme}
          />
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className={`mb-12 p-6 rounded-3xl backdrop-blur-xl border transition-all duration-500 ${theme.card} ${theme.cardBorder}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`${theme.text.muted} text-xs uppercase tracking-wide mb-1`}>Next {category} Tier</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = (Icons as any)[nextTier.icon] || Icons.Star
                    return <IconComponent className="h-5 w-5" style={{ color: nextTier.color }} />
                  })()}
                  <span className={`${theme.text.primary} font-semibold text-lg`}>{nextTier.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${theme.text.primary}`}>{nextTier.contracts_required - filteredTotalSales}</div>
                <p className={`${theme.text.muted} text-xs`}>remaining</p>
              </div>
            </div>
            <Progress value={progressToNext} className="h-2 mb-3" />
            <div className="flex items-center justify-between text-sm">
              <span className={theme.text.muted}>{filteredTotalSales} / {nextTier.contracts_required}</span>
              <span className="text-emerald-400 font-semibold">+CHF {nextTier.bonus_amount}</span>
            </div>
          </div>
        )}

        {/* All Tiers - Visual Timeline */}
        <div className="mb-8">
          <h3 className={`${theme.text.primary} font-semibold text-lg mb-6 text-center transition-colors duration-500`}>{category} Bonus Journey</h3>
          <div className="space-y-3">
            {stats.tiers.map((tier: any, index: number) => {
              const isUnlocked = filteredTotalSales >= tier.contracts_required
              const isCurrent = currentTier?.id === tier.id
              const IconComponent = (Icons as any)[tier.icon] || Icons.Star

              return (
                <div
                  key={tier.id}
                  className={`relative p-4 rounded-2xl transition-all duration-500 ${isUnlocked
                    ? `bg-gradient-to-r from-white/15 to-white/5 border-2 ${theme.cardBorder}`
                    : `${theme.cardInactive} border ${theme.cardInactiveBorder}`
                    } ${isCurrent ? `ring-2 ring-white/40 ring-offset-2 ring-offset-slate-900` : ''
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
                          <h4 className={`font-semibold ${isUnlocked ? theme.text.primary : theme.iconMuted
                            }`}>{tier.name}</h4>
                          {isCurrent && (
                            <span className={`px-2 py-0.5 text-xs font-medium ${theme.accent}/30 ${theme.secondary} rounded-full`}>
                              Current
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isUnlocked ? theme.text.secondary : theme.iconMuted
                          }`}>
                          {tier.contracts_required} contracts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isUnlocked ? 'text-emerald-400' : theme.iconMuted
                        }`}>
                        CHF {tier.bonus_amount}
                      </div>
                      <div className={`text-xs ${theme.iconMuted}`}>Bonus</div>
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
