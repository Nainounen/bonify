'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, LayoutDashboard } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type SalesDistributionChartProps = {
  stats: {
    wireline: number
    wireless: number
  }
  users: any[]
  theme: any
}

const USER_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#14b8a6', '#f43f5e']

export function SalesDistributionChart({ stats, users, theme }: SalesDistributionChartProps) {
  const [pieChartTab, setPieChartTab] = useState<'user' | 'type'>('user')

  const pieData = useMemo(() => {
    if (pieChartTab === 'user') {
      // Sales by user
      const userSalesMap = new Map<string, number>()
      users.forEach(user => {
        const totalSales = user.sales?.length || 0
        if (totalSales > 0) {
          userSalesMap.set(user.name, totalSales)
        }
      })
      return Array.from(userSalesMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    } else {
      // Sales by contract type
      return [
        { name: 'Wireline', value: stats.wireline },
        { name: 'Wireless', value: stats.wireless }
      ]
    }
  }, [pieChartTab, stats, users])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
        <CardHeader>
          <CardTitle className={theme.text.primary}>Sales Distribution</CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setPieChartTab('user')}
              variant={pieChartTab === 'user' ? 'default' : 'outline'}
              className={pieChartTab === 'user' ? theme.buttonGradient : `${theme.card} ${theme.cardBorder}`}
            >
              <Users className="h-4 w-4 mr-2" />
              By User
            </Button>
            <Button
              onClick={() => setPieChartTab('type')}
              variant={pieChartTab === 'type' ? 'default' : 'outline'}
              className={pieChartTab === 'type' ? theme.buttonGradient : `${theme.card} ${theme.cardBorder}`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              By Type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]" style={{ minHeight: 0 }}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={USER_COLORS[index % USER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-full ${theme.text.muted}`}>
              No sales data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
