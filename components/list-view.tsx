'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Trophy, ArrowLeft, Palette, Check, Download } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { themes, getTheme } from '@/lib/themes'
import { exportToCSV, formatLeaderboardForExport } from '@/lib/export'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { DateFilter } from '@/components/date-filter'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ListViewProps = {
  user: any
  leaderboard: any[]
  userContext?: {
    role: string
    regionId?: string
    shopId?: string
    availableShops?: { id: string, name: string }[]
    currentFilter: string
    currentShopFilter?: string
  }
}

export function ListView({ user, leaderboard, userContext }: ListViewProps) {
  const [currentThemeId, setCurrentThemeId] = useState('default')
  const [view, setView] = useState<'all' | 'wireless' | 'wireline'>('all')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bonify-theme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme)
    }
  }, [])

  const updateFilter = (filterType: string, shopId?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filterType)
    if (shopId) {
      params.set('shopId', shopId)
    } else {
      params.delete('shopId')
    }
    router.push(`?${params.toString()}`)
  }


  // Save theme to localStorage when changed
  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId)
    localStorage.setItem('bonify-theme', themeId)
  }

  const theme = getTheme(currentThemeId).variants.Internet

  const handleExportLeaderboard = () => {
    if (!rateLimiter.check('export', RATE_LIMITS.EXPORT)) {
      const resetTime = rateLimiter.getResetTime('export', RATE_LIMITS.EXPORT)
      toast.error(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)}s`)
      return
    }

    try {
      const csvData = formatLeaderboardForExport(leaderboard)
      exportToCSV(csvData, `leaderboard-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Leaderboard exported successfully')
    } catch (error) {
      toast.error('Failed to export leaderboard')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${theme.background}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b ${theme.navBar} ${theme.navBarBorder} safe-top`}>
        <div className="container mx-auto max-w-2xl px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {user.email !== 'list@admin.com' && (
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation shrink-0`}>
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            )}
            <div className="min-w-0">
              <p className={`${theme.text.primary} text-sm sm:text-base font-medium`}>Leaderboard</p>
              <p className={`${theme.text.muted} text-xs sm:text-sm`}>Employee Rankings</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <DateFilter />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportLeaderboard}
              className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
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
                      <div className={`w-4 h-4 rounded-full bg-linear-to-br ${t.icon}`} />
                      <span className={currentThemeId === t.id ? 'font-bold text-white' : 'text-white/70'}>
                        {t.name}
                      </span>
                      {currentThemeId === t.id && <Check className="h-3 w-3 ml-auto" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <form action={signOut}>
              <Button variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation`}>
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 pb-24 sm:pb-20 safe-bottom">

        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center justify-center p-2.5 sm:p-3 rounded-full mb-3 sm:mb-4 ${theme.card}`}>
            <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${theme.text.primary} mb-1 sm:mb-2`}>Top Performers</h1>
          <p className={`${theme.text.muted} text-sm sm:text-base`}>See who's leading the sales charts</p>
        </div>

        {/* Role-based Filter Controls */}
        {userContext && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center items-center">
            <Select
              value={userContext.currentFilter}
              onValueChange={(val) => updateFilter(val)}
            >
              <SelectTrigger className="w-45 bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="my_shop">My Shop</SelectItem>
                <SelectItem value="region">Whole Region</SelectItem>
                {['regional_manager', 'director'].includes(userContext.role) && (
                  <SelectItem value="specific_shop">Specific Shop...</SelectItem>
                )}
              </SelectContent>
            </Select>

            {userContext.currentFilter === 'specific_shop' && userContext.availableShops && (
              <Select
                value={userContext.currentShopFilter || ''}
                onValueChange={(val) => updateFilter('specific_shop', val)}
              >
                <SelectTrigger className="w-50 bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select Shop" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white h-60">
                  {userContext.availableShops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <div className={`flex p-1 rounded-xl ${theme.card} ${theme.cardBorder} border`}>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'all'
                ? `${theme.primary} text-white shadow-lg`
                : `${theme.text.muted} hover:${theme.text.primary}`
                }`}
            >
              All
            </button>
            <button
              onClick={() => setView('wireless')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'wireless'
                ? `${theme.primary} text-white shadow-lg`
                : `${theme.text.muted} hover:${theme.text.primary}`
                }`}
            >
              Wireless
            </button>
            <button
              onClick={() => setView('wireline')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'wireline'
                ? `${theme.primary} text-white shadow-lg`
                : `${theme.text.muted} hover:${theme.text.primary}`
                }`}
            >
              Wireline
            </button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {[...leaderboard]
            .sort((a, b) => {
              if (view === 'wireless') return b.wirelessSales - a.wirelessSales || b.totalSales - a.totalSales
              if (view === 'wireline') return b.wirelineSales - a.wirelineSales || b.totalSales - a.totalSales
              return b.totalSales - a.totalSales
            })
            .map((employee, index) => {
              const isCurrentUser = employee.id === user.id
              const displayValue = view === 'wireless' ? employee.wirelessSales : (view === 'wireline' ? employee.wirelineSales : employee.totalSales)
              const displayLabel = view === 'wireless' ? 'Wireless' : (view === 'wireline' ? 'Wireline' : 'Total')

              return (
                <div
                  key={employee.id}
                  className={`relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all
                  ${isCurrentUser
                      ? `${theme.card} ${theme.cardBorder} shadow-lg`
                      : `${theme.cardInactive} ${theme.cardInactiveBorder} hover:${theme.card}`
                    }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="flex-none w-6 sm:w-8 text-center">
                      <span className={`text-base sm:text-lg font-bold ${index < 3 ? 'text-yellow-400' : theme.iconMuted}`}>
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h3 className={`font-medium truncate text-sm sm:text-base ${isCurrentUser ? theme.text.primary : theme.text.secondary}`}>
                          {employee.name}
                        </h3>
                        {isCurrentUser && (
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-wide ${theme.accent}/20 ${theme.primary} whitespace-nowrap shrink-0`}>
                            You
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 sm:gap-2 text-xs ${theme.text.muted}`}>
                        <span>{employee.role === 'shop_manager' ? 'Shop Manager' : employee.role === 'internal_sales' ? 'Internal' : 'External'}</span>
                        {employee.projectedBonus > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">CHF {employee.projectedBonus.toFixed(0)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 text-right shrink-0">
                      {view === 'all' && (
                        <>
                          <div className="hidden md:block">
                            <div className={`text-sm font-medium ${theme.primary}`}>{employee.wirelineSales}</div>
                            <div className={`text-[10px] ${theme.iconMuted} uppercase`}>W+</div>
                          </div>
                          <div className="hidden md:block">
                            <div className={`text-sm font-medium ${theme.secondary}`}>{employee.wirelessSales}</div>
                            <div className={`text-[10px] ${theme.iconMuted} uppercase`}>W-</div>
                          </div>
                        </>
                      )}
                      <div>
                        <div className={`text-lg sm:text-xl font-bold ${theme.text.primary}`}>{displayValue}</div>
                        <div className={`text-xs ${theme.text.muted}`}>{displayLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

          {leaderboard.length === 0 && (
            <div className={`text-center py-12 ${theme.iconMuted}`}>
              No employees found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
