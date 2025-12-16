'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Users, Wifi, Smartphone, AlertTriangle, RefreshCw, Palette, Check } from 'lucide-react'
import { deleteAllSales, deleteUser } from './actions'
import { toast } from 'sonner'
import { signOut } from '@/app/login/actions'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { themes, GlobalTheme } from '@/lib/themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AdminViewProps = {
  stats: {
    internet: number
    mobile: number
    total: number
    salesByDate: any[]
  }
  users: any[]
}

const COLORS = ['#6366f1', '#a855f7']

export function AdminView({ stats, users }: AdminViewProps) {
  const [isDeletingSales, setIsDeletingSales] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [currentThemeId, setCurrentThemeId] = useState('default')
  const router = useRouter()
  
  const theme = themes[currentThemeId].variants.Internet // Admin view doesn't need category switching

  const handleDeleteAllSales = async () => {
    if (!confirm('Are you sure you want to DELETE ALL SALES? This cannot be undone.')) return

    setIsDeletingSales(true)
    const result = await deleteAllSales()
    setIsDeletingSales(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('All sales deleted successfully')
      router.refresh()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their sales.')) return

    setDeletingUserId(userId)
    const result = await deleteUser(userId)
    setDeletingUserId(null)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('User deleted successfully')
      router.refresh()
    }
  }

  const pieData = [
    { name: 'Internet', value: stats.internet },
    { name: 'Mobile', value: stats.mobile },
  ]

  return (
    <div className={`min-h-screen p-8 overflow-hidden relative transition-colors duration-700 ${theme.background} ${theme.text.primary}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-4xl font-bold ${theme.text.primary}`}
          >
            Admin Command Center
          </motion.h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass}`}>
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
            <Button variant="outline" size="icon" onClick={() => router.refresh()} className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass}`}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <form action={signOut}>
              <Button variant="outline" className={`${theme.card} ${theme.cardBorder} ${theme.text.primary} hover:${theme.glass} hover:text-red-400`}>Sign Out</Button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.text.muted}`}>Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${theme.text.primary}`}>
                  {stats.total}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.primary} flex items-center gap-2`}>
                  <Wifi className="h-4 w-4" /> Internet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${theme.primary}`}>{stats.internet}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${theme.secondary} flex items-center gap-2`}>
                  <Smartphone className="h-4 w-4" /> Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${theme.secondary}`}>{stats.mobile}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
              <CardHeader>
                <CardTitle className={theme.text.primary}>Sales Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="internet" name="Internet" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mobile" name="Mobile" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
              <CardHeader>
                <CardTitle className={theme.text.primary}>Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
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
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder} h-full`}>
              <CardHeader>
                <CardTitle className={`${theme.text.primary} flex items-center gap-2`}>
                  <Users className="h-5 w-5" /> Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {users.map((user) => (
                    <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl ${theme.cardInactive} border ${theme.cardInactiveBorder} hover:${theme.glass} transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`font-medium ${theme.text.primary}`}>{user.name}</div>
                          <div className={`text-sm ${theme.text.muted}`}>{user.email}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deletingUserId === user.id}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className={`text-center ${theme.text.muted} py-8`}>No users found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className={`${theme.card} backdrop-blur-xl border-red-500/30 h-full`}>
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription className={theme.text.muted}>
                  Irreversible actions. Proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm ${theme.text.secondary}`}>
                  Deleting all sales will reset the leaderboard and all user progress. This action cannot be undone.
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAllSales}
                  disabled={isDeletingSales}
                  className="w-full"
                >
                  {isDeletingSales ? 'Deleting...' : 'Delete All Sales Database'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
