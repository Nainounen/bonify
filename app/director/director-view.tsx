'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Plus, Map, TrendingUp, Users, Building2, Search, AlertTriangle, LogOut, Palette, Check } from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { createRegion, assignRegionalManager, createRegionalManager, searchPotentialManagers } from './actions'
import { signOut } from '@/app/login/actions'
import { getTheme, themes } from '@/lib/themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateFilter } from '@/components/date-filter'
import { useRouter } from 'next/navigation'

type DirectorViewProps = {
  initialRegions: any[]
  stats: any
  user: any
}

export function DirectorView({ initialRegions, stats, user }: DirectorViewProps) {
  const router = useRouter()
  // Use initialRegions directly to ensure updates from router.refresh() are reflected
  const regions = initialRegions

  const [newRegionName, setNewRegionName] = useState('')
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Theme State
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

  // Assign Manager State
  const [selectedRegion, setSelectedRegion] = useState<any>(null) // Region being edited
  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false)
  const [managerSearchQuery, setManagerSearchQuery] = useState('')
  const [managerSearchResults, setManagerSearchResults] = useState<any[]>([])
  const [selectedUserToAssign, setSelectedUserToAssign] = useState<any>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false) // Confirmation for promotion

  // Create Manager State
  const [newManagerName, setNewManagerName] = useState('')
  const [newManagerEmail, setNewManagerEmail] = useState('')
  const [newManagerPassword, setNewManagerPassword] = useState('')

  // Create Region Manager State
  const [crTab, setCrTab] = useState('existing')
  const [crManagerQuery, setCrManagerQuery] = useState('')
  const [crManagerResults, setCrManagerResults] = useState<any[]>([])
  const [crSelectedManager, setCrSelectedManager] = useState<any>(null)
  const [crNewManager, setCrNewManager] = useState({ name: '', email: '', password: '' })

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounced Search for "Create Region"
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (crManagerQuery.trim().length >= 2) {
        searchPotentialManagers(crManagerQuery).then(res => setCrManagerResults(res))
      } else {
        setCrManagerResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [crManagerQuery])

  // Debounced Search for "Assign Manager"
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (managerSearchQuery.trim().length >= 2) {
        searchPotentialManagers(managerSearchQuery).then(res => setManagerSearchResults(res))
      } else {
        setManagerSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [managerSearchQuery])

  // Theme
  const theme = getTheme(currentThemeId).variants.Internet

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!newRegionName.trim()) {
      toast.error('Region name is required')
      setLoading(false)
      return
    }

    let payload: any = { name: newRegionName }

    if (crTab === 'existing') {
      if (!crSelectedManager) {
        toast.error('Please select a manager')
        setLoading(false)
        return
      }
      payload.managerId = crSelectedManager.id
    } else {
      if (!crNewManager.name || !crNewManager.email || !crNewManager.password) {
        toast.error('Please fill all manager fields')
        setLoading(false)
        return
      }
      payload.newManager = crNewManager
    }

    const res = await createRegion(payload)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(res.partial ? 'Region created (Manager issue)' : 'Region created with Manager')
      router.refresh()
      setIsAddRegionOpen(false)
      setNewRegionName('')
      setCrSelectedManager(null)
      setCrNewManager({ name: '', email: '', password: '' })
      setCrManagerResults([])
      setCrManagerQuery('')
    }
  }


  const handleSearchManagers = async () => {
    // Legacy mapping kept for other refs, but search is now side-effect based
    if (managerSearchQuery.length < 2) return
    const res = await searchPotentialManagers(managerSearchQuery)
    setManagerSearchResults(res)
  }


  const handleAssignClick = (region: any) => {
    setSelectedRegion(region)
    setIsAssignManagerOpen(true)
    setManagerSearchQuery('')
    setManagerSearchResults([])
    setSelectedUserToAssign(null)
  }

  const selectUserForAssignment = (user: any) => {
    setSelectedUserToAssign(user)
    if (user.role !== 'regional_manager') {
      setIsConfirmOpen(true) // Needs confirmation to promote
    } else {
      // Already a RM, just reassigning region?
      // Direct assignment
      performAssignment(user.id)
    }
  }

  const performAssignment = async (userId: string) => {
    setLoading(true)
    const res = await assignRegionalManager(selectedRegion.id, userId)
    setLoading(false)
    setIsConfirmOpen(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Manager assigned successfully')
      setIsAssignManagerOpen(false)
      window.location.reload()
    }
  }

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRegion) return

    setLoading(true)
    const res = await createRegionalManager({
      name: newManagerName,
      email: newManagerEmail,
      password: newManagerPassword,
      regionId: selectedRegion.id
    })
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('New Regional Manager created')
      setIsAssignManagerOpen(false)
      window.location.reload()
    }
  }

  // Chart Data
  const chartData = regions.map((r: any) => ({
    name: r.name,
    sales: r.salesCount,
    shops: r.shopCount,
    topSellers: r.topSellersCount || 0,
    totalBonus: r.totalBonusAmount || 0
  })).sort((a: any, b: any) => b.sales - a.sales)

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text.primary} p-6`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Director Dashboard</h1>
            <p className={`${theme.text.secondary}`}>Overview of all Regions and Performance</p>
          </div>
          <div className="flex items-center gap-2">
            <DateFilter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className={`${theme.glass} border ${theme.glassBorder} ${theme.text.primary} hover:opacity-80 transition-all`}>
                  <Palette className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-48 backdrop-blur-xl border ${currentThemeId === 'swisscom' ? 'bg-white/95 border-slate-200' : 'bg-slate-950/90 border-slate-800'} ${theme.text.primary}`}>
                {Object.values(themes).map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`cursor-pointer ${currentThemeId === 'swisscom' ? 'hover:bg-slate-100 focus:bg-slate-100' : 'hover:bg-white/10 focus:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-4 h-4 rounded-full bg-linear-to-br ${t.icon}`} />
                      <span className={currentThemeId === t.id ? `font-bold ${theme.text.primary}` : `${theme.text.secondary}`}>
                        {t.name}
                      </span>
                      {currentThemeId === t.id && <Check className={`h-3 w-3 ml-auto ${theme.text.primary}`} />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <form action={signOut}>
              <Button variant="ghost" className={`${theme.glass} border ${theme.glassBorder} ${theme.text.primary} hover:opacity-80 transition-all`}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${theme.card} border ${theme.cardBorder}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme.text.muted}`}>Total Regions</p>
                  <h3 className="text-2xl font-bold">{stats.totalRegions}</h3>
                </div>
                <Map className={`h-8 w-8 ${theme.primary} opacity-50`} />
              </div>
            </CardContent>
          </Card>
          <Card className={`${theme.card} border ${theme.cardBorder}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme.text.muted}`}>Total Managers</p>
                  <h3 className="text-2xl font-bold">{stats.totalManagers}</h3>
                </div>
                <Users className={`h-8 w-8 ${theme.primary} opacity-50`} />
              </div>
            </CardContent>
          </Card>
          <Card className={`${theme.card} border ${theme.cardBorder}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme.text.muted}`}>Total Shops</p>
                  <h3 className="text-2xl font-bold">{stats.totalShops}</h3>
                </div>
                <Building2 className={`h-8 w-8 ${theme.primary} opacity-50`} />
              </div>
            </CardContent>
          </Card>
          <Card className={`${theme.card} border ${theme.cardBorder}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme.text.muted}`}>Total Sales</p>
                  <h3 className="text-2xl font-bold">{stats.totalSales}</h3>
                </div>
                <TrendingUp className={`h-8 w-8 ${theme.primary} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {mounted ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="overview">Overview & Stats</TabsTrigger>
              <TabsTrigger value="regions">Manage Regions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className={`${theme.card} border ${theme.cardBorder}`}>
                <CardHeader>
                  <CardTitle>Sales by Region</CardTitle>
                  <CardDescription>Comparison of total sales performance across all regions</CardDescription>
                </CardHeader>
                <CardContent className="h-100">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        />
                        <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      Loading chart...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Sellers Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className={`${theme.card} border ${theme.cardBorder}`}>
                  <CardHeader>
                    <CardTitle>Top Sellers by Region</CardTitle>
                    <CardDescription>Number of employees exceeding targets (&gt;100% ZER)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        />
                        <Bar dataKey="topSellers" name="Top Sellers" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className={`${theme.card} border ${theme.cardBorder}`}>
                  <CardHeader>
                    <CardTitle>Total Bonus by Region</CardTitle>
                    <CardDescription>Total bonus payout amount (CHF)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tickFormatter={(value) => `CHF ${value}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                          formatter={(value: any) => [`CHF ${Number(value).toFixed(2)}`, 'Total Bonus']}
                        />
                        <Bar dataKey="totalBonus" name="Total Bonus" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regions">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">All Regions</h2>
                <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" /> Add Region
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Region</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateRegion} className="space-y-6 pt-4">

                      <div className="space-y-2">
                        <Label>Region Name</Label>
                        <Input
                          value={newRegionName}
                          onChange={e => setNewRegionName(e.target.value)}
                          placeholder="e.g. Zurich East"
                          className="bg-slate-800 border-slate-700"
                          required
                        />
                      </div>

                      <div className="border-t border-slate-800 pt-4">
                        <Label className="mb-2 block text-base font-semibold">Assign Regional Manager (Required)</Label>

                        <Tabs value={crTab} onValueChange={setCrTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-slate-800 mb-4">
                            <TabsTrigger value="existing">Existing Employee</TabsTrigger>
                            <TabsTrigger value="new">Create New</TabsTrigger>
                          </TabsList>

                          <TabsContent value="existing" className="space-y-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Search existing employees..."
                                value={crManagerQuery}
                                onChange={e => setCrManagerQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault() // Prevent form submission
                                  }
                                }}
                                className="bg-slate-800 border-slate-700"
                              />
                              <Button type="button" onClick={() => { }} variant="secondary" className="cursor-default opacity-50">
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>

                            {crSelectedManager ? (
                              <div className="p-3 bg-indigo-900/40 border border-indigo-500/50 rounded flex justify-between items-center">
                                <div>
                                  <div className="font-bold text-white">{crSelectedManager.name}</div>
                                  <div className="text-xs text-indigo-300">{crSelectedManager.email}</div>
                                </div>
                                <Button size="sm" variant="ghost" type="button" onClick={() => setCrSelectedManager(null)}>
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {crManagerResults.map(user => (
                                  <div key={user.id} className="p-2 bg-slate-800 rounded flex items-center justify-between border border-slate-700">
                                    <div className="truncate mr-2">
                                      <div className="font-medium text-sm">{user.name}</div>
                                      <div className="text-xs text-slate-400">{user.email}</div>
                                    </div>
                                    <Button size="sm" type="button" onClick={() => setCrSelectedManager(user)}>
                                      Select
                                    </Button>
                                  </div>
                                ))}
                                {crManagerResults.length === 0 && crManagerQuery.length > 2 && (
                                  <div className="text-center text-slate-500 text-sm py-2">No users found.</div>
                                )}
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="new" className="space-y-4">
                            <div className="space-y-2">
                              <Label>Full Name</Label>
                              <Input
                                value={crNewManager.name}
                                onChange={e => setCrNewManager({ ...crNewManager, name: e.target.value })}
                                className="bg-slate-800 border-slate-700"
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={crNewManager.email}
                                onChange={e => setCrNewManager({ ...crNewManager, email: e.target.value })}
                                className="bg-slate-800 border-slate-700"
                                placeholder="john@swisscom.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={crNewManager.password}
                                onChange={e => setCrNewManager({ ...crNewManager, password: e.target.value })}
                                className="bg-slate-800 border-slate-700"
                                placeholder="Min. 6 characters"
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Creating...' : 'Create Region & Assign Manager'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regions.map((region: any) => (
                  <Card key={region.id} className={`${theme.card} border ${theme.cardBorder} hover:bg-white/5 transition-colors`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-medium">{region.name}</CardTitle>
                      <Map className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Total Sales</span>
                          <span className="font-bold flex items-center">
                            {region.salesCount} <TrendingUp className="h-3 w-3 ml-1 text-green-400" />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Shops</span>
                          <span className="font-mono">{region.shopCount}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Regional Manager</p>
                          {region.manager ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                                  {region.manager.name.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-sm font-medium truncate">{region.manager.name}</p>
                                  <p className="text-xs text-slate-400 truncate">{region.manager.email}</p>
                                </div>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => handleAssignClick(region)}>
                                <UserPlus className="h-4 w-4 text-slate-400" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-dashed border-slate-600 hover:border-slate-500 text-slate-400"
                              onClick={() => handleAssignClick(region)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" /> Assign Manager
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="h-10 w-64 bg-slate-800/50 rounded-lg animate-pulse" />
            <div className="h-125 w-full bg-slate-800/20 rounded-xl animate-pulse" />
          </div>
        )}

        {/* Assign Manager Dialog */}
        <Dialog open={isAssignManagerOpen} onOpenChange={setIsAssignManagerOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Assign Manager for {selectedRegion?.name}</DialogTitle>
              <DialogDescription>Select an existing employee or create a new Regional Manager.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="existing" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="existing">Existing Employee</TabsTrigger>
                <TabsTrigger value="new">Create New</TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-4 pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name..."
                    value={managerSearchQuery}
                    onChange={e => setManagerSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault() // Prevent form submission
                      }
                    }}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Button onClick={() => { }} variant="secondary" className="cursor-default opacity-50">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto min-h-25">
                  {managerSearchResults.map(user => (
                    <div key={user.id} className="p-3 bg-slate-800 rounded flex items-center justify-between border border-slate-700">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-400">Current Role: {user.role}</div>
                      </div>
                      <Button size="sm" onClick={() => selectUserForAssignment(user)}>
                        Select
                      </Button>
                    </div>
                  ))}
                  {managerSearchResults.length === 0 && (
                    <div className="text-center text-slate-500 py-4">Search for an employee...</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4 pt-4">
                <form onSubmit={handleCreateManager} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={newManagerName} onChange={e => setNewManagerName(e.target.value)} required className="bg-slate-800 border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={newManagerEmail} onChange={e => setNewManagerEmail(e.target.value)} required className="bg-slate-800 border-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={newManagerPassword} onChange={e => setNewManagerPassword(e.target.value)} required className="bg-slate-800 border-slate-700" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">Create & Assign</Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog for Promotion */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" /> Confirm Promotion
              </DialogTitle>
              <DialogDescription>
                User <strong>{selectedUserToAssign?.name}</strong> is currently a <strong>{selectedUserToAssign?.role}</strong>.
                Assigning them as Regional Manager will promote them and remove them from their current shop (if any).
                Are you sure?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
              <Button onClick={() => performAssignment(selectedUserToAssign.id)} className="bg-yellow-600 hover:bg-yellow-700">
                Confirm Promotion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

function Edit2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}
