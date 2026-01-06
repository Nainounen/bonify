'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, Smartphone } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type SalesTrendChartProps = {
  salesByUserAndDate: any[]
  theme: any
}

const USER_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#14b8a6', '#f43f5e']

export function SalesTrendChart({ salesByUserAndDate, theme }: SalesTrendChartProps) {
  const [activeTab, setActiveTab] = useState<'Wireless' | 'Wireline'>('Wireline')

  const chartData = (() => {
    // Get all unique dates from the selected category
    const categoryData = salesByUserAndDate.filter((d: any) => d.category === activeTab)
    const allDates = new Set<string>()
    categoryData.forEach((userData: any) => {
      userData.data.forEach((d: any) => allDates.add(d.date))
    })
    
    // Create data structure with all dates
    const sortedDates = Array.from(allDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    )
    
    return sortedDates.map(date => {
      const dataPoint: any = { date }
      categoryData.forEach((userData: any) => {
        const dateData = userData.data.find((d: any) => d.date === date)
        dataPoint[userData.userName] = dateData ? dateData.count : 0
      })
      return dataPoint
    })
  })()

  const categoryUsers = salesByUserAndDate.filter((d: any) => d.category === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
        <CardHeader>
          <CardTitle className={theme.text.primary}>Sales Trend by User (Last 7 Days)</CardTitle>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setActiveTab('Wireline')}
              variant={activeTab === 'Wireline' ? 'default' : 'outline'}
              className={activeTab === 'Wireline' ? theme.buttonGradient : `${theme.card} ${theme.cardBorder}`}
            >
              <Wifi className="h-4 w-4 mr-2" />
              Wireline
            </Button>
            <Button
              onClick={() => setActiveTab('Wireless')}
              variant={activeTab === 'Wireless' ? 'default' : 'outline'}
              className={activeTab === 'Wireless' ? theme.buttonGradient : `${theme.card} ${theme.cardBorder}`}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Wireless
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]" style={{ minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: 'Contracts Sold', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              {categoryUsers.map((userData: any, index: number) => (
                <Line
                  key={userData.userName}
                  type="monotone"
                  dataKey={userData.userName}
                  stroke={USER_COLORS[index % USER_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
