'use client'

import { useState } from 'react'
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
} from "@/components/ui/dropdown-menu"

type ListViewProps = {
  user: any
  leaderboard: any[]
}

export function ListView({ user, leaderboard }: ListViewProps) {
  const [currentThemeId, setCurrentThemeId] = useState('default')
  
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
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b ${theme.navBar} ${theme.navBarBorder}`}>
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.email !== 'list@admin.com' && (
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10`}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <div>
              <p className={`${theme.text.primary} text-sm font-medium`}>Leaderboard</p>
              <p className={`${theme.text.muted} text-xs`}>Employee Rankings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleExportLeaderboard}
              className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10`}
            >
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10`}>
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
                      {currentThemeId === t.id && <Check className="h-3 w-3 ml-auto" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <form action={signOut}>
              <Button variant="ghost" size="sm" className={`${theme.text.secondary} hover:${theme.text.primary} hover:bg-slate-500/10`}>
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8 pb-20">

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center p-3 rounded-full mb-4 ${theme.card}`}>
            <Trophy className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Top Performers</h1>
          <p className={theme.text.muted}>See who's leading the sales charts</p>
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
                    ? `${theme.card} ${theme.cardBorder} shadow-lg`
                    : `${theme.cardInactive} ${theme.cardInactiveBorder} hover:${theme.card}`
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-none w-8 text-center">
                    <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-400' : theme.iconMuted}`}>
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${isCurrentUser ? theme.text.primary : theme.text.secondary}`}>
                        {employee.name}
                      </h3>
                      {isCurrentUser && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${theme.accent}/20 ${theme.primary}`}>
                          You
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${theme.text.muted}`}>
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
                      <div className={`text-sm font-medium ${theme.primary}`}>{employee.internetSales}</div>
                      <div className={`text-[10px] ${theme.iconMuted} uppercase`}>Net</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${theme.secondary}`}>{employee.mobileSales}</div>
                      <div className={`text-[10px] ${theme.iconMuted} uppercase`}>Mob</div>
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${theme.text.primary}`}>{employee.totalSales}</div>
                      <div className={`text-xs ${theme.text.muted}`}>Total</div>
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
