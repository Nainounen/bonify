'use client'

import { useState, useTransition, useEffect } from 'react'
import { CounterButton } from '@/components/counter-button'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import * as Icons from 'lucide-react'
import { Zap, LogOut, Undo2, Palette, Trophy, Shield, TrendingUp, Target, Coins } from 'lucide-react'
import { themes, getTheme } from '@/lib/themes'
import { signOut } from '@/app/login/actions'
import { undoLastSale } from '@/app/dashboard/undo-actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatZER, formatCurrency, getZERColor } from '@/lib/bonus-calculator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShopManagementTab } from './shop-management-tab'
import { DashboardSkeleton } from '@/components/loading-skeletons'
import { DateFilter } from './date-filter'

type DashboardViewProps = {
  stats: any
  shopData?: {
    employees: any[]
    targets: any[]
  } | null
}

export function DashboardView({ stats, shopData }: DashboardViewProps) {
  const [category, setCategory] = useState<'Wireline' | 'Wireless'>('Wireline')
  const [currentThemeId, setCurrentThemeId] = useState('default')
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  // Default tab based on role? Or just default to 'my-stats'
  const isManager = stats.employee.role === 'shop_manager'

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('bonify-theme')
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme)
    }
  }, [])

  if (!mounted) return <DashboardSkeleton />

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

  // Get ZER colors
  const wirelessZERColor = getZERColor(stats.wirelessZER)
  const wirelineZERColor = getZERColor(stats.wirelineZER)
  const currentZER = category === 'Wireless' ? stats.wirelessZER : stats.wirelineZER
  const currentZERColor = category === 'Wireless' ? wirelessZERColor : wirelineZERColor

  // Color map
  const colorMap = {
    red: { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', accent: 'bg-red-500' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', accent: 'bg-yellow-500' },
    green: { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', accent: 'bg-green-500' },
  }

  const currentColor = colorMap[currentZERColor]

  const salesDashboardContent = (
    <div className="w-full pb-24 sm:pb-20 safe-bottom">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="mx-auto max-w-2xl lg:max-w-none lg:col-span-8 lg:col-start-2 xl:col-span-8 xl:col-start-2">
          {/* Hero Stats Section */}
          <div className="py-6 sm:py-8 text-center">
            {/* Current Month Indicator */}
            <div className="flex flex-col items-center gap-4 mb-4 sm:mb-6">
              <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-sm ${theme.glass}`}>
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
                <span className={`text-xs sm:text-sm font-medium ${theme.text.primary}`}>
                  {new Date(stats.year, stats.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <DateFilter className="bg-white/10 border-white/20 text-white" />
            </div>

            {/* ZER Display */}
            {stats.hasTarget ? (
              stats.employee.role === 'shop_manager' ? (
                <div className="mb-5 sm:mb-6">
                  <div className={`text-5xl sm:text-6xl md:text-7xl font-bold ${currentColor.text} mb-2 transition-colors duration-500`}>
                    {stats.wirelessZER > 100 ? formatCurrency(stats.projectedBonus) : `${stats.wirelessZER.toFixed(0)}%`}
                  </div>
                  <p className={`${theme.text.secondary} text-xs sm:text-sm uppercase tracking-wider transition-colors duration-500`}>
                    {stats.wirelessZER > 100 ? 'YTD Bonus (CHF)' : 'YTD Achievement (%)'}
                  </p>
                </div>
              ) : (
                <div className="mb-5 sm:mb-6">
                  <div className={`text-6xl sm:text-7xl md:text-8xl font-bold ${currentColor.text} mb-2 transition-colors duration-500`}>
                    {currentZER.toFixed(1)}%
                  </div>
                  <p className={`${theme.text.secondary} text-xs sm:text-sm uppercase tracking-wider transition-colors duration-500`}>
                    {category} ZER (Target Achievement)
                  </p>
                </div>
              )
            ) : (
              <div className="mb-5 sm:mb-6">
                <div className={`text-6xl sm:text-7xl md:text-8xl font-bold ${theme.text.primary} mb-2 transition-colors duration-500`}>
                  {category === 'Wireless' ? stats.wirelessCount : stats.wirelineCount}
                </div>
                <p className={`${theme.text.secondary} text-xs sm:text-sm uppercase tracking-wider transition-colors duration-500`}>
                  {category} Sales (No Target Set)
                </p>
              </div>
            )}

            {/* Category Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs mx-auto mb-6 sm:mb-8">
              <div className={`rounded-2xl p-3 border transition-all duration-500 ${category === 'Wireline' ? `${theme.card} ${theme.cardBorder}` : `${theme.cardInactive} ${theme.cardInactiveBorder}`
                }`}>
                <div className={`flex items-center justify-center gap-2 mb-1 ${theme.secondary}`}>
                  <Icons.Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Wireline</span>
                </div>
                <div className={`text-xl font-bold ${theme.text.primary}`}>{stats.wirelineCount}</div>
                {stats.hasTarget && (
                  <div className={`text-xs ${theme.text.muted} mt-1`}>
                    {stats.wirelineTarget > 0 ? `${formatZER(stats.wirelineZER)}` : 'No target'}
                  </div>
                )}
              </div>
              <div className={`rounded-2xl p-3 border transition-all duration-500 ${category === 'Wireless' ? `${theme.card} ${theme.cardBorder}` : `${theme.cardInactive} ${theme.cardInactiveBorder}`
                }`}>
                <div className={`flex items-center justify-center gap-2 mb-1 ${theme.secondary}`}>
                  <Icons.Smartphone className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Wireless</span>
                </div>
                <div className={`text-xl font-bold ${theme.text.primary}`}>{stats.wirelessCount}</div>
                {stats.hasTarget && (
                  <div className={`text-xs ${theme.text.muted} mt-1`}>
                    {stats.wirelessTarget > 0 ? `${formatZER(stats.wirelessZER)}` : 'No target'}
                  </div>
                )}
              </div>
            </div>

            {/* Bonus and Stats - Only show for non-managers as they see total bonus above */}
            {stats.employee.role !== 'shop_manager' && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400">{formatCurrency(stats.projectedBonus)}</div>
                  <p className={`${theme.text.muted} text-[10px] sm:text-xs uppercase tracking-wide mt-1`}>Projected Bonus</p>
                </div>
                {stats.hasTarget && (
                  <>
                    <div className={`h-10 sm:h-12 w-px ${theme.divider}`}></div>
                    <div className="text-center">
                      <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme.primary} transition-colors duration-500`}>
                        {category === 'Wireless' ? stats.wirelessTarget : stats.wirelineTarget}
                      </div>
                      <p className={`${theme.text.muted} text-[10px] sm:text-xs uppercase tracking-wide mt-1`}>{category} Target</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Leaderboard Quick Access Card */}
          <Link href="/list" className="block mb-6 sm:mb-8">
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border transition-all duration-500 active:scale-[0.98] sm:hover:scale-[1.02] cursor-pointer ${theme.card} ${theme.cardBorder} hover:${theme.glass} touch-manipulation`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${theme.accent}/20 shrink-0`}>
                    <Trophy className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.primary}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`${theme.text.primary} font-semibold text-base sm:text-lg mb-0.5 sm:mb-1`}>View Leaderboard</h3>
                    <p className={`${theme.text.muted} text-xs sm:text-sm truncate`}>See how you rank against others</p>
                  </div>
                </div>
                <Icons.ChevronRight className={`h-5 w-5 sm:h-6 sm:w-6 ${theme.text.muted} shrink-0`} />
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

          {/* ZER Progress Cards */}
          {stats.hasTarget && (
            <div className="space-y-4 mb-8 sm:mb-12">
              {/* Wireless ZER */}
              {stats.wirelessTarget > 0 && (
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border transition-all duration-500 ${colorMap[wirelessZERColor].bg
                  } ${colorMap[wirelessZERColor].border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`${theme.text.muted} text-xs uppercase tracking-wide mb-1`}>Wireless (W-)</p>
                      <div className="flex items-center gap-2">
                        <Icons.Smartphone className={`h-5 w-5 ${colorMap[wirelessZERColor].text}`} />
                        <span className={`${theme.text.primary} font-semibold text-lg`}>{formatZER(stats.wirelessZER)}</span>
                        {stats.wirelessZER >= 100 && stats.wirelessZER <= 120 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/30 text-yellow-300 rounded-full">Level 1</span>
                        )}
                        {stats.wirelessZER > 120 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-500/30 text-green-300 rounded-full">Level 2</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${theme.text.primary}`}>{stats.wirelessCount} / {stats.wirelessTarget}</div>
                      <p className={`${theme.text.muted} text-xs`}>contracts</p>
                    </div>
                  </div>
                  <Progress value={Math.min((stats.wirelessCount / stats.wirelessTarget) * 100, 100)} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme.text.muted}>
                      {stats.wirelessCount >= stats.wirelessTarget
                        ? `+${stats.wirelessCount - stats.wirelessTarget} over target`
                        : `${stats.wirelessTarget - stats.wirelessCount} remaining`}
                    </span>
                    {stats.wirelessZER < 100 && <span className={colorMap[wirelessZERColor].text}>Below Target</span>}
                    {stats.wirelessZER >= 100 && stats.wirelessZER <= 120 && <span className={colorMap[wirelessZERColor].text}>Good Performance</span>}
                    {stats.wirelessZER > 120 && <span className={colorMap[wirelessZERColor].text}>Top Performance!</span>}
                  </div>
                </div>
              )}

              {/* Wireline ZER */}
              {stats.wirelineTarget > 0 && (
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border transition-all duration-500 ${colorMap[wirelineZERColor].bg
                  } ${colorMap[wirelineZERColor].border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`${theme.text.muted} text-xs uppercase tracking-wide mb-1`}>Wireline (W+)</p>
                      <div className="flex items-center gap-2">
                        <Icons.Wifi className={`h-5 w-5 ${colorMap[wirelineZERColor].text}`} />
                        <span className={`${theme.text.primary} font-semibold text-lg`}>{formatZER(stats.wirelineZER)}</span>
                        {stats.wirelineZER >= 100 && stats.wirelineZER <= 120 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/30 text-yellow-300 rounded-full">Level 1</span>
                        )}
                        {stats.wirelineZER > 120 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-500/30 text-green-300 rounded-full">Level 2</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${theme.text.primary}`}>{stats.wirelineCount} / {stats.wirelineTarget}</div>
                      <p className={`${theme.text.muted} text-xs`}>contracts</p>
                    </div>
                  </div>
                  <Progress value={Math.min((stats.wirelineCount / stats.wirelineTarget) * 100, 100)} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className={theme.text.muted}>
                      {stats.wirelineCount >= stats.wirelineTarget
                        ? `+${stats.wirelineCount - stats.wirelineTarget} over target`
                        : `${stats.wirelineTarget - stats.wirelineCount} remaining`}
                    </span>
                    {stats.wirelineZER < 100 && <span className={colorMap[wirelineZERColor].text}>Below Target</span>}
                    {stats.wirelineZER >= 100 && stats.wirelineZER <= 120 && <span className={colorMap[wirelineZERColor].text}>Good Performance</span>}
                    {stats.wirelineZER > 120 && <span className={colorMap[wirelineZERColor].text}>Top Performance!</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Target Warning */}
          {!stats.hasTarget && (
            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border ${theme.card} ${theme.cardBorder} mb-8`}>
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-yellow-400 shrink-0" />
                <div>
                  <p className={`${theme.text.primary} font-semibold mb-1`}>No Target Set</p>
                  <p className={`${theme.text.muted} text-sm`}>Contact your administrator to set your monthly targets.</p>
                </div>
              </div>
            </div>
          )}
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
                    <span className={`${theme.text.muted} text-sm`}>Employment</span>
                    <span className={`${theme.text.primary} text-sm font-semibold`}>
                      {stats.employee.employment_percentage}%
                    </span>
                  </div>
                </div>
                {stats.hasTarget && (
                  <>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`${theme.text.muted} text-sm`}>Wireless ZER</span>
                        <span className={`${colorMap[wirelessZERColor].text} font-semibold`}>
                          {formatZER(stats.wirelessZER)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`${theme.text.muted} text-sm`}>Wireline ZER</span>
                        <span className={`${colorMap[wirelineZERColor].text} font-semibold`}>
                          {formatZER(stats.wirelineZER)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
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
                        {sale.category === 'Wireline' ? (
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
  )

  return (
    <div className={`min-h-screen transition-colors duration-700 ${theme.background}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 border-b ${theme.navBar} ${theme.navBarBorder} safe-top`}>
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className={`${theme.text.primary} text-sm sm:text-base font-medium truncate`}>{stats.employee!.name}</p>
            <p className={`${theme.text.secondary} text-xs sm:text-sm`}>
              {stats.employee.role === 'shop_manager' ? 'Shop Manager' : stats.employee.role === 'internal_sales' ? 'Internal Sales' : 'External Sales'}
            </p>
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
                      <div className={`w-4 h-4 rounded-full bg-linear-to-br ${t.icon}`} />
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

      {/* Content Area with Conditional Tabs */}
      {isManager && shopData ? (
        <Tabs defaultValue="my-stats" className="w-full">
          <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-2">
            <TabsList className="bg-white/10 border border-white/10">
              <TabsTrigger value="my-stats" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">My Sales</TabsTrigger>
              <TabsTrigger value="management" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Shop Management</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="my-stats">
            {salesDashboardContent}
          </TabsContent>
          <TabsContent value="management">
            <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4">
              <ShopManagementTab
                employees={shopData.employees}
                targets={shopData.targets}
                theme={theme}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        salesDashboardContent
      )}
    </div>
  )
}
