'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getTheme, themes } from '@/lib/themes'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { exportToCSV, formatSalesForExport } from '@/lib/export'
import { AdminHeader } from './components/admin-header'
import { StatsCards } from './components/stats-cards'
import { SalesTrendChart } from './components/sales-trend-chart'
import { SalesDistributionChart } from './components/sales-distribution-chart'
import { DangerZone } from './components/danger-zone'
import { EmployeeManagement } from './components/employee-management'

type AdminViewProps = {
  stats: {
    internet: number
    mobile: number
    total: number
    salesByDate: any[]
    salesByUserAndDate: any[]
  }
  users: any[]
}

export function AdminView({ stats, users }: AdminViewProps) {
  const [currentThemeId, setCurrentThemeId] = useState('default')
  const router = useRouter()
  
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
  
  const theme = getTheme(currentThemeId).variants.Internet

  const handleExportSales = async () => {
    if (!rateLimiter.check('export', RATE_LIMITS.EXPORT)) {
      const resetTime = rateLimiter.getResetTime('export', RATE_LIMITS.EXPORT)
      toast.error(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)}s`)
      return
    }

    try {
      // Fetch all sales data
      const salesData = users.flatMap(user => 
        user.sales?.map((sale: any) => ({
          ...sale,
          employee_name: user.name,
          employee_email: user.email
        })) || []
      )
      
      const csvData = formatSalesForExport(salesData)
      exportToCSV(csvData, `all-sales-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Sales exported successfully')
    } catch (error) {
      toast.error('Failed to export sales')
    }
  }

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className={`min-h-screen p-3 sm:p-6 md:p-8 overflow-hidden relative transition-colors duration-700 ${theme.background} ${theme.text.primary} safe-top safe-bottom`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative z-10">
        <AdminHeader 
          theme={theme}
          currentThemeId={currentThemeId}
          onThemeChange={handleThemeChange}
          onExport={handleExportSales}
          onRefresh={handleRefresh}
        />

        <StatsCards stats={stats} theme={theme} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <SalesTrendChart salesByUserAndDate={stats.salesByUserAndDate} theme={theme} />
          <SalesDistributionChart stats={stats} users={users} theme={theme} />
        </div>

        <EmployeeManagement users={users} theme={theme} />

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 mt-6">
          <DangerZone theme={theme} />
        </div>
      </div>
    </div>
  )
}
