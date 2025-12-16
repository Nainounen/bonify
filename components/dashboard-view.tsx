'use client'

import { useState, useTransition, useEffect } from 'react'
import { CounterButton } from '@/components/counter-button'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import * as Icons from 'lucide-react'
import { Zap, LogOut, Undo2, Palette, Trophy, Shield } from 'lucide-react'
import { themes, getTheme } from '@/lib/themes'
import { signOut } from '@/app/login/actions'
import { undoLastSale } from '@/app/dashboard/undo-actions'
import { toast } from 'sonner'
import Link from 'next/link'
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
  const [isPending, startTransition] = useTransition()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bonify-theme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme)
    }
  }, [])

  // Save theme to localStorage when changed
  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId)
    localStorage.setItem('bonify-theme', themeId)
  }

  const globalTheme = getTheme(currentThemeId)
  const theme = globalTheme.variants[category]

  const handleUndo = () => {
    startTransition(async () => {
      const result = await undoLastSale()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Last sale deleted successfully')
      }
    })
  }

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
      <div className={`sticky top-0 z-50 border-b ${theme.navBar} ${theme.navBarBorder} safe-top`}>
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className={`${theme.text.primary} text-sm sm:text-base font-medium truncate`}>{stats.employee!.name}</p>
            <p className={`${theme.text.secondary} text-xs sm:text-sm`}>{currentTier?.name || 'Starter'} Tier</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/list">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}
              >
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            {stats.employee?.email === 'admin@admin.com' && (
              <Link href="/admin">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}
                >
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleUndo}
              disabled={isPending || stats.sales.length === 0}
              className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10 disabled:opacity-50 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}
            >
              <Undo2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-white">
                {Object.values(themes).map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
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
              <Button variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="w-full pb-24 sm:pb-20 safe-bottom">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Main Content */}
        <div className="mx-auto max-w-2xl lg:max-w-none lg:col-span-8 lg:col-start-2 xl:col-span-8 xl:col-start-2">
        {/* Hero Stats Section */}
        <div className="py-6 sm:py-8 text-center">
          <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm mb-4 sm:mb-6 ${theme.glass}`}>
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
            <span className={`text-xs sm:text-sm font-medium ${theme.text.primary}`}>{stats.totalSales} Total Contracts Sold</span>
          </div>

          <div className="mb-5 sm:mb-6">
            <div className={`text-6xl sm:text-7xl md:text-8xl font-bold ${theme.text.primary} mb-2 transition-colors duration-500`}>{filteredTotalSales}</div>
            <p className={`${theme.text.secondary} text-xs sm:text-sm uppercase tracking-wider transition-colors duration-500`}>{category} Sales</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs mx-auto mb-6 sm:mb-8">
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

          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400">CHF {stats.totalBonus.toFixed(0)}</div>
              <p className={`${theme.text.muted} text-[10px] sm:text-xs uppercase tracking-wide mt-1`}>Total Earned</p>
            </div>
            <div className={`h-10 sm:h-12 w-px ${theme.divider}`}></div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme.primary} transition-colors duration-500`}>{nextTier ? nextTier.contracts_required - filteredTotalSales : 0}</div>
              <p className={`${theme.text.muted} text-[10px] sm:text-xs uppercase tracking-wide mt-1`}>To Next {category} Tier</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Quick Access Card */}
        <Link href="/list" className="block mb-6 sm:mb-8">
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border transition-all duration-500 active:scale-[0.98] sm:hover:scale-[1.02] cursor-pointer ${theme.card} ${theme.cardBorder} hover:${theme.glass} touch-manipulation`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${theme.accent}/20 flex-shrink-0`}>
                  <Trophy className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.primary}`} />
                </div>
                <div className="min-w-0">
                  <h3 className={`${theme.text.primary} font-semibold text-base sm:text-lg mb-0.5 sm:mb-1`}>View Leaderboard</h3>
                  <p className={`${theme.text.muted} text-xs sm:text-sm truncate`}>See how you rank against others</p>
                </div>
              </div>
              <Icons.ChevronRight className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.text.muted} flex-shrink-0`} />
            </div>
          </div>
        </Link>

        {/* Counter Button - Prominent */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-12">
          <p className={`${theme.text.muted} text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-wider`}>Tap to Log Sale</p>
          <CounterButton
            category={category}
            onCategoryChange={setCategory}
            theme={globalTheme}
          />
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className={`mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border transition-all duration-500 ${theme.card} ${theme.cardBorder}`}>
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
          <h3 className={`${theme.text.primary} font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-center transition-colors duration-500`}>{category} Bonus Journey</h3>
          <div className="space-y-2 sm:space-y-3">
            {stats.tiers.map((tier: any, index: number) => {
              const isUnlocked = filteredTotalSales >= tier.contracts_required
              const isCurrent = currentTier?.id === tier.id
              const IconComponent = (Icons as any)[tier.icon] || Icons.Star

              return (
                <div
                  key={tier.id}
                  className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 ${isUnlocked
                    ? `bg-gradient-to-r from-white/15 to-white/5 border-2 ${theme.cardBorder}`
                    : `${theme.cardInactive} border ${theme.cardInactiveBorder}`
                    } ${isCurrent ? `ring-2 ring-white/40 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900` : ''
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex-shrink-0 ${isUnlocked ? 'bg-white/20' : 'bg-white/5'
                          }`}
                        style={{ backgroundColor: isUnlocked ? `${tier.color}30` : undefined }}
                      >
                        <IconComponent
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          style={{ color: isUnlocked ? tier.color : '#ffffff50' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <h4 className={`font-semibold text-sm sm:text-base ${isUnlocked ? theme.text.primary : theme.iconMuted
                            }`}>{tier.name}</h4>
                          {isCurrent && (
                            <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium ${theme.accent}/30 ${theme.secondary} rounded-full whitespace-nowrap`}>
                              Current
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] sm:text-xs ${isUnlocked ? theme.text.secondary : theme.iconMuted
                          }`}>
                          {tier.contracts_required} contracts
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-base sm:text-lg font-bold ${isUnlocked ? 'text-emerald-400' : theme.iconMuted
                        }`}>
                        CHF {tier.bonus_amount}
                      </div>
                      <div className={`text-[10px] sm:text-xs ${theme.iconMuted}`}>Bonus</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </div>
        {/* End Main Content */}

        {/* Desktop-only Side Panel with Additional Stats */}
        <div className="hidden lg:block lg:col-span-3 lg:col-start-10 xl:col-span-3 xl:col-start-10">
          <div className="sticky top-24">
            {/* Quick Stats Card */}
            <div className={`p-6 rounded-3xl backdrop-blur-xl border transition-all duration-500 mb-4 ${theme.card} ${theme.cardBorder}`}>
              <h3 className={`${theme.text.primary} font-semibold text-lg mb-4`}>Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`${theme.text.muted} text-sm`}>Completion</span>
                    <span className={`${theme.text.primary} text-sm font-semibold`}>
                      {Math.round((filteredTotalSales / (nextTier?.contracts_required || 1)) * 100)}%
                    </span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${theme.text.muted} text-sm`}>Avg per Day</span>
                    <span className={`${theme.text.primary} font-semibold`}>
                      {(stats.totalSales / Math.max(1, Math.ceil((Date.now() - new Date(stats.sales[stats.sales.length - 1]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${theme.text.muted} text-sm`}>Total Contracts</span>
                    <span className={`${theme.text.primary} font-semibold`}>{stats.totalSales}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Desktop Only */}
            <div className={`p-6 rounded-3xl backdrop-blur-xl border transition-all duration-500 ${theme.card} ${theme.cardBorder}`}>
              <h3 className={`${theme.text.primary} font-semibold text-lg mb-4`}>Recent Sales</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {stats.sales.slice(0, 10).map((sale: any, index: number) => (
                  <div key={sale.id} className={`p-3 rounded-xl ${theme.cardInactive} border ${theme.cardInactiveBorder}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sale.category === 'Internet' ? (
                          <Icons.Wifi className={`h-4 w-4 ${theme.primary}`} />
                        ) : (
                          <Icons.Smartphone className={`h-4 w-4 ${theme.secondary}`} />
                        )}
                        <span className={`${theme.text.primary} text-sm font-medium`}>
                          {sale.category}
                        </span>
                      </div>
                      <span className={`${theme.text.muted} text-xs`}>
                        {new Date(sale.created_at).toLocaleDateString('de-CH', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
