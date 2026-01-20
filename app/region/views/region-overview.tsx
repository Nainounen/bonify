'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createShopAndManager, searchEmployees, createShopManager, assignShopManager } from '../actions'
import { toast } from 'sonner'
import { Plus, Store, UserPlus, TrendingUp, Trophy, Palette, Check, LogOut, Search, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { themes, getTheme } from '@/lib/themes'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'

export function RegionalOverview({ data, user }: { data: any, user: any }) {
  const router = useRouter()
  const [isCreateShopOpen, setIsCreateShopOpen] = useState(false)
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentThemeId, setCurrentThemeId] = useState('default')

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
  const theme = globalTheme.variants['Wireline'] // Default to Wireline variant for consistent styling

  // Form states
  const [newShopName, setNewShopName] = useState('')
  const [managerMode, setManagerMode] = useState<'new' | 'existing'>('existing')

  // New Manager Form
  const [managerName, setManagerName] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')

  // Existing Manager Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [promoteConfirm, setPromoteConfirm] = useState(false)

  // Search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        const results = await searchEmployees(searchQuery)
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!newShopName.trim()) {
      toast.error('Shop name is required')
      return
    }

    if (managerMode === 'existing') {
      if (!selectedEmployee) {
        toast.error('Please select an employee')
        return
      }
      if (selectedEmployee.role !== 'shop_manager' && !promoteConfirm) {
        toast.error('Please confirm promotion of this employee')
        return
      }
    } else {
      if (!managerName || !managerEmail || !managerPassword) {
        toast.error('All manager details are required')
        return
      }
    }

    setLoading(true)
    const res = await createShopAndManager({
      shopName: newShopName,
      managerMode,
      managerData: {
        name: managerName,
        email: managerEmail,
        password: managerPassword,
        id: selectedEmployee?.id
      }
    })
    setLoading(false)

    if (res.error) toast.error(res.error)
    else {
      toast.success('Shop created and manager assigned')
      router.refresh()
      setIsCreateShopOpen(false)
      // Reset form
      setNewShopName('')
      setManagerName('')
      setManagerEmail('')
      setManagerPassword('')
      setSearchQuery('')
      setSelectedEmployee(null)
      setPromoteConfirm(false)
    }
  }

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShopId) return

    setLoading(true)
    let res;

    if (managerMode === 'existing') {
      if (!selectedEmployee) {
        toast.error('Please select an employee')
        setLoading(false)
        return
      }
      res = await assignShopManager({
        shopId: selectedShopId,
        employeeId: selectedEmployee.id
      })
    } else {
      res = await createShopManager({
        name: managerName,
        email: managerEmail,
        password: managerPassword,
        shopId: selectedShopId
      })
    }

    setLoading(false)
    if (res.error) toast.error(res.error)
    else {
      toast.success(managerMode === 'existing' ? 'Manager assigned' : 'Manager created')
      router.refresh()
      setIsCreateManagerOpen(false)
      setManagerName('')
      setManagerEmail('')
      setManagerPassword('')
      setSearchQuery('')
      setSelectedEmployee(null)
      setManagerMode('existing')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${theme.background}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 border-b ${theme.navBar} ${theme.navBarBorder} safe-top`}>
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className={`${theme.text.primary} text-sm sm:text-base font-medium truncate`}>{user.name}</p>
            <p className={`${theme.text.secondary} text-xs sm:text-sm`}>
              Regional Manager
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
                      {currentThemeId === t.id && <Check className="h-3 w-3 ml-auto" />}
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

      <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text.primary}`}>
              {data.regionName} Region
            </h1>
            <p className={theme.text.secondary}>Overview for {new Date(data.year, data.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          </div>
          <Dialog open={isCreateShopOpen} onOpenChange={(open) => {
            setIsCreateShopOpen(open)
            if (!open) {
              setNewShopName('')
              setManagerMode('existing')
              setManagerName('')
              setManagerEmail('')
              setManagerPassword('')
              setSearchQuery('')
              setSelectedEmployee(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button className={`${theme.primary} text-white border-0`}>
                <Plus className="mr-2 h-4 w-4" /> New Shop
              </Button>
            </DialogTrigger>
            <DialogContent className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder} text-white max-w-lg`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>Add New Shop & Manager</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateShop} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className={theme.text.secondary}>Shop Name</Label>
                  <Input
                    value={newShopName}
                    onChange={e => setNewShopName(e.target.value)}
                    className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                    required
                    placeholder="e.g. Swisscom Shop Bern"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={theme.text.secondary}>Assign Shop Manager</Label>
                  <Tabs value={managerMode} onValueChange={(v: any) => setManagerMode(v)} className="w-full">
                    <TabsList className="bg-white/5 w-full">
                      <TabsTrigger value="existing" className="w-1/2 data-[state=active]:bg-white/10 text-slate-400 data-[state=active]:text-white">Existing Employee</TabsTrigger>
                      <TabsTrigger value="new" className="w-1/2 data-[state=active]:bg-white/10 text-slate-400 data-[state=active]:text-white">New User</TabsTrigger>
                    </TabsList>

                    <TabsContent value="existing" className="space-y-4 pt-4">
                      <div className="space-y-2 relative">
                        <Label className="text-xs text-slate-400">Search Employee</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8 bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        {searchResults.length > 0 && !selectedEmployee && (
                          <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map(emp => (
                              <div
                                key={emp.id}
                                className="p-2 hover:bg-slate-700 cursor-pointer text-sm"
                                onClick={() => {
                                  setSelectedEmployee(emp)
                                  setSearchQuery(emp.name)
                                  setSearchResults([])
                                }}
                              >
                                <div className="font-medium text-white">{emp.name}</div>
                                <div className="text-xs text-slate-400">{emp.email} • {emp.role}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedEmployee && (
                        <div className={`p-4 rounded-lg bg-white/5 border border-white/10 space-y-3`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-white">{selectedEmployee.name}</div>
                              <div className="text-sm text-slate-400">{selectedEmployee.email}</div>
                              <div className="text-xs text-slate-500 mt-1">Current Role: <span className="text-white capitalize">{selectedEmployee.role.replace('_', ' ')}</span></div>
                              {selectedEmployee.shops && (
                                <div className="text-xs text-slate-500">Current Shop: <span className="text-white">{selectedEmployee.shops.name}</span></div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(null)
                                setSearchQuery('')
                                setPromoteConfirm(false)
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              Change
                            </Button>
                          </div>

                          {selectedEmployee.role !== 'shop_manager' && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3 text-orange-200">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-orange-400" />
                                <span className="font-semibold text-sm">Promotion Required</span>
                              </div>
                              <p className="text-xs opacity-90">
                                This user is currently a {selectedEmployee.role.replace('_', ' ')}. Assigning them will promote them to Shop Manager.
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="confirm-promote"
                                  checked={promoteConfirm}
                                  onChange={e => setPromoteConfirm(e.target.checked)}
                                  className="rounded border-orange-500/30 bg-orange-500/10 text-orange-500 focus:ring-orange-500/50"
                                />
                                <label htmlFor="confirm-promote" className="text-xs font-medium cursor-pointer select-none">
                                  I confirm this promotion
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="new" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label className={theme.text.secondary}>Manager Name</Label>
                        <Input
                          value={managerName}
                          onChange={e => setManagerName(e.target.value)}
                          className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={theme.text.secondary}>Email</Label>
                        <Input
                          type="email"
                          value={managerEmail}
                          onChange={e => setManagerEmail(e.target.value)}
                          className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                          placeholder="email@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={theme.text.secondary}>Password</Label>
                        <Input
                          type="password"
                          value={managerPassword}
                          onChange={e => setManagerPassword(e.target.value)}
                          className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                          placeholder="••••••••"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Button type="submit" className={`w-full ${theme.primary} text-white`} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Shop & Assign Manager'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${theme.text.secondary}`}>Total Wireless</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>{data.totalWireless}</div>
            </CardContent>
          </Card>
          <Card className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${theme.text.secondary}`}>Total Wireline</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>{data.totalWireline}</div>
            </CardContent>
          </Card>
          <Card className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${theme.text.secondary}`}>Active Shops</CardTitle>
              <Store className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>{data.shops.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder}`}>
          <CardHeader>
            <CardTitle className={theme.text.primary}>Shop Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.shops}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="wireless" name="Wireless" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wireline" name="Wireline" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shops Grid */}
        <div>
          <h2 className={`text-xl font-semibold mb-4 ${theme.text.primary}`}>Shop Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.shops.map((shop: any) => (
              <Card key={shop.id} className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder} hover:border-white/30 transition-colors`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-lg font-semibold ${theme.text.primary}`}>{shop.name}</CardTitle>
                  <Store className={`h-5 w-5 ${theme.text.secondary}`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className={theme.text.secondary}>Employees</span>
                      <span className={`font-medium ${theme.text.primary}`}>{shop.employees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme.text.secondary}>Sales (This Month)</span>
                      <span className={`font-medium ${theme.text.primary}`}>{shop.wireless + shop.wireline}</span>
                    </div>

                    {shop.manager && (
                      <div className="flex justify-between text-sm items-center border-t border-white/5 pt-3 mt-1">
                        <div className="flex flex-col">
                          <span className={theme.text.secondary}>Manager</span>
                          <span className={`font-medium ${theme.text.primary}`}>{shop.manager.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`font-medium ${theme.text.primary}`}>
                            {shop.ytdPercentage?.toFixed(0) || 0}%
                            <span className="mx-1 text-slate-600">|</span>
                            Fr. {shop.ytdBonus?.toFixed(0) || 0}
                          </div>
                          <span className={`text-xs ${theme.text.secondary}`}>YTD Performance</span>
                        </div>
                      </div>
                    )}

                    <Dialog open={isCreateManagerOpen && selectedShopId === shop.id} onOpenChange={(open) => {
                      setIsCreateManagerOpen(open)
                      if (!open) {
                        setSelectedShopId(null)
                        setManagerMode('existing')
                        setManagerName('')
                        setManagerEmail('')
                        setManagerPassword('')
                        setSearchQuery('')
                        setSelectedEmployee(null)
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className={`w-full bg-white/5 hover:bg-white/10 border border-white/10 ${theme.text.primary} mt-2`}
                          onClick={() => {
                            setSelectedShopId(shop.id)
                            setIsCreateManagerOpen(true)
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" /> {shop.manager ? 'Manage Manager' : 'Add Manager'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`backdrop-blur-xl border ${theme.card} ${theme.cardBorder} text-white`}>
                        <DialogHeader>
                          <DialogTitle className={theme.text.primary}>Add Manager for {shop.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateManager} className="space-y-4 pt-4">
                          <Tabs value={managerMode} onValueChange={(v: any) => setManagerMode(v)} className="w-full">
                            <TabsList className="bg-white/5 w-full">
                              <TabsTrigger value="existing" className="w-1/2 data-[state=active]:bg-white/10 text-slate-400 data-[state=active]:text-white">Existing Employee</TabsTrigger>
                              <TabsTrigger value="new" className="w-1/2 data-[state=active]:bg-white/10 text-slate-400 data-[state=active]:text-white">New User</TabsTrigger>
                            </TabsList>

                            <TabsContent value="existing" className="space-y-4 pt-4">
                              <div className="space-y-2 relative">
                                <Label className="text-xs text-slate-400">Search Employee</Label>
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                  <Input
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 bg-white/5 border-white/10 text-white"
                                  />
                                </div>
                                {searchResults.length > 0 && !selectedEmployee && (
                                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {searchResults.map(emp => (
                                      <div
                                        key={emp.id}
                                        className="p-2 hover:bg-slate-700 cursor-pointer text-sm"
                                        onClick={() => {
                                          setSelectedEmployee(emp)
                                          setSearchQuery(emp.name)
                                          setSearchResults([])
                                        }}
                                      >
                                        <div className="font-medium text-white">{emp.name}</div>
                                        <div className="text-xs text-slate-400">{emp.email} • {emp.role}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {selectedEmployee && (
                                <div className={`p-4 rounded-lg bg-white/5 border border-white/10 space-y-3`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-white">{selectedEmployee.name}</div>
                                      <div className="text-sm text-slate-400">{selectedEmployee.email}</div>
                                      <div className="text-xs text-slate-500 mt-1">Current Role: <span className="text-white capitalize">{selectedEmployee.role.replace('_', ' ')}</span></div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedEmployee(null)
                                        setSearchQuery('')
                                      }}
                                      className="text-slate-400 hover:text-white"
                                    >
                                      Change
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 rounded bg-indigo-500/10 text-indigo-200 text-xs border border-indigo-500/20">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>This user will be promoted to Shop Manager</span>
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="new" className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label className={theme.text.secondary}>Name</Label>
                                <Input
                                  value={managerName}
                                  onChange={e => setManagerName(e.target.value)}
                                  className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                                  required={managerMode === 'new'}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className={theme.text.secondary}>Email</Label>
                                <Input
                                  type="email"
                                  value={managerEmail}
                                  onChange={e => setManagerEmail(e.target.value)}
                                  className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                                  required={managerMode === 'new'}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className={theme.text.secondary}>Password</Label>
                                <Input
                                  type="password"
                                  value={managerPassword}
                                  onChange={e => setManagerPassword(e.target.value)}
                                  className={`bg-white/5 border-white/10 text-white focus:border-${theme.accent} focus:ring-${theme.accent}`}
                                  required={managerMode === 'new'}
                                />
                              </div>
                            </TabsContent>
                          </Tabs>

                          <Button type="submit" className={`w-full ${theme.primary} text-white border-0 hover:opacity-90 mt-4`} disabled={loading}>
                            {loading ? 'Processing...' : (managerMode === 'existing' ? 'Assign Manager' : 'Create Manager')}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
