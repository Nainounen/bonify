'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs' // Add Tabs import
import { UserPlus, Save, Trash2, Target, Users, Search, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  createShopEmployee,
  deleteShopEmployee,
  setShopEmployeeTarget,
  searchEmployees,
  addExistingShopEmployee,
  updateShopEmployee
} from '@/app/dashboard/shop-manager-actions'
import { SalesTrendChart } from '@/app/admin/components/sales-trend-chart'
import { SalesDistributionChart } from '@/app/admin/components/sales-distribution-chart'
import { useMemo } from 'react'
import { MANAGER_BONUS_PER_POINT, MANAGER_MAX_ZER, formatCurrency } from '@/lib/bonus-calculator'

type ShopManagementTabProps = {
  employees: any[]
  targets: any[]
  theme: any
}

export function ShopManagementTab({ employees, targets, theme }: ShopManagementTabProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  // New User Form keys
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'internal_sales' | 'external_sales'>('internal_sales')
  const [newEmploymentPercentage, setNewEmploymentPercentage] = useState(100)

  // Existing user search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Edit User Form keys
  const [editRole, setEditRole] = useState<'internal_sales' | 'external_sales'>('internal_sales')
  const [editEmploymentPercentage, setEditEmploymentPercentage] = useState(100)

  // Calculate charts data
  const { salesByUserAndDate, stats } = useMemo(() => {
    const allSales = employees.flatMap(emp =>
      (emp.sales || []).map((sale: any) => ({
        ...sale,
        employees: { name: emp.name }
      }))
    )

    // Stats for distribution chart
    const stats = {
      wireline: allSales.filter(s => s.category === 'Wireline').length,
      wireless: allSales.filter(s => s.category === 'Wireless').length
    }

    // Sales Trend Logic
    const salesByUserMap: any = {}

    // Process last 30 days of sales for better trend visibility, though chart might filter to 7
    const today = new Date()
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))

    const recentSales = allSales.filter(s => new Date(s.created_at) >= thirtyDaysAgo)

    recentSales.forEach((sale: any) => {
      const date = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const userName = sale.employees?.name || 'Unknown'
      const key = `${userName}-${sale.category}`

      if (!salesByUserMap[key]) {
        salesByUserMap[key] = {
          userName,
          category: sale.category,
          salesByDate: {}
        }
      }

      if (!salesByUserMap[key].salesByDate[date]) {
        salesByUserMap[key].salesByDate[date] = 0
      }

      salesByUserMap[key].salesByDate[date]++
    })

    const salesByUserAndDate = Object.values(salesByUserMap).map((userData: any) => {
      // Sort dates
      const dates = Object.keys(userData.salesByDate).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
      )

      return {
        userName: userData.userName,
        category: userData.category,
        data: dates.map(date => ({
          date,
          count: userData.salesByDate[date]
        }))
      }
    })

    return { salesByUserAndDate, stats }
  }, [employees])

  // Targets state
  const [localTargets, setLocalTargets] = useState<Record<string, { wireless: number, wireline: number, shopManagerYtdPercentage?: number }>>(() => {
    const initial: any = {}
    employees.forEach(emp => {
      const t = targets.find(t => t.employee_id === emp.id)
      initial[emp.id] = {
        wireless: t?.wireless_target || 0,
        wireline: t?.wireline_target || 0,
        shopManagerYtdPercentage: t?.shop_manager_ytd_percentage || 0
      }
    })
    return initial
  })

  // Sync entries for new employees
  useEffect(() => {
    setLocalTargets(prev => {
      const next = { ...prev }
      let changed = false
      employees.forEach(emp => {
        if (!next[emp.id]) {
          const t = targets.find(t => t.employee_id === emp.id)
          next[emp.id] = {
            wireless: t?.wireless_target || 0,
            wireline: t?.wireline_target || 0,
            shopManagerYtdPercentage: t?.shop_manager_ytd_percentage || 0
          }
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [employees, targets])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createShopEmployee({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      employmentPercentage: newEmploymentPercentage
    })
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Employee created successfully')
      setIsAddUserOpen(false)
      resetForm()
    }
  }

  const handleSearch = async () => {
    if (searchQuery.length < 2) return
    setIsSearching(true)
    const results = await searchEmployees(searchQuery)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleAddExisting = async (userId: string) => {
    setLoading(true)
    const res = await addExistingShopEmployee(userId, newRole, newEmploymentPercentage) // Pass role and % if needed, or default
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Employee added to shop')
      setIsAddUserOpen(false)
      resetForm()
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    const res = await updateShopEmployee({
      id: editingUser.id,
      role: editRole,
      employmentPercentage: editEmploymentPercentage
    })
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Employee updated successfully')
      setIsEditUserOpen(false)
      setEditingUser(null)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will delete all their sales data.`)) return

    const res = await deleteShopEmployee(id)
    if (res.error) toast.error(res.error)
    else toast.success('Employee deleted')
  }

  const handleSaveTargets = async () => {
    setLoading(true)
    try {
      const promises = Object.entries(localTargets).map(([empId, target]) =>
        setShopEmployeeTarget({
          employeeId: empId,
          wirelessTarget: target.wireless,
          wirelineTarget: target.wireline,
          shopManagerYtdPercentage: target.shopManagerYtdPercentage
        })
      )
      await Promise.all(promises)
      toast.success('Targets saved successfully')
    } catch (e) {
      toast.error('Failed to save targets')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setNewRole('internal_sales')
    setNewEmploymentPercentage(100)
    setSearchQuery('')
    setSearchResults([])
  }

  const openEditModal = (emp: any) => {
    setEditingUser(emp)
    setEditRole(emp.role)
    setEditEmploymentPercentage(emp.employment_percentage)
    setIsEditUserOpen(true)
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <SalesTrendChart salesByUserAndDate={salesByUserAndDate} theme={theme} />
        <SalesDistributionChart stats={stats} users={employees} theme={theme} />
      </div>

      <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className={theme.text.primary}>Shop Employees</CardTitle>
            <CardDescription className={theme.text.muted}>Manage your team and their monthly targets</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveTargets}
              disabled={loading}
              variant="outline"
              className="border-slate-600 hover:bg-slate-800"
            >
              <Save className="mr-2 h-4 w-4" /> Save Targets
            </Button>

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Employee</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="new" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                    <TabsTrigger value="new">New Account</TabsTrigger>
                    <TabsTrigger value="existing">Existing Account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="new">
                    <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} required className="bg-slate-800 border-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="bg-slate-800 border-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="bg-slate-800 border-slate-700" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="internal_sales">Internal</SelectItem>
                              <SelectItem value="external_sales">External</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Employment %</Label>
                          <Input type="number" min="0" max="100" value={newEmploymentPercentage} onChange={e => setNewEmploymentPercentage(parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>Create Account</Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="existing" className="space-y-4 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                      />
                      <Button onClick={handleSearch} disabled={isSearching || searchQuery.length < 2}>
                        {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map(user => (
                        <div key={user.id} className="p-3 bg-slate-800 rounded flex items-center justify-between">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                            <div className="text-xs text-slate-500">
                              {user.shop_id ? `In shop: ${user.shops?.name || 'Unknown'}` : 'No Shop'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={!!user.shop_id}
                            onClick={() => handleAddExisting(user.id)}
                            variant={user.shop_id ? "secondary" : "default"}
                          >
                            {user.shop_id ? 'Assigned' : 'Add'}
                          </Button>
                        </div>
                      ))}
                      {searchResults.length === 0 && searchQuery.length > 2 && !isSearching && (
                        <div className="text-center text-slate-500 py-4">No users found</div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Edit Employee: {editingUser?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={editRole} onValueChange={(v: any) => setEditRole(v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="internal_sales">Internal Sales</SelectItem>
                        <SelectItem value="external_sales">External Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employment %</Label>
                    <Input type="number" min="0" max="100" value={editEmploymentPercentage} onChange={e => setEditEmploymentPercentage(parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Update Employee</Button>
                </form>
              </DialogContent>
            </Dialog>

          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No employees found. Add one to get started.</div>
            ) : (
              <div className="space-y-4">
                {employees.map(emp => (
                  <div key={emp.id} className={`p-4 rounded-lg border ${theme.cardInactiveBorder} bg-slate-800/50 flex flex-col md:flex-row items-center gap-4`}>
                    <div className="flex-1 min-w-50">
                      <div className="flex items-center gap-2">
                        <div className={`font-semibold ${theme.text.primary}`}>{emp.name}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${emp.role === 'internal_sales' ? 'bg-blue-500/20 text-blue-300' :
                          emp.role === 'shop_manager' ? 'bg-indigo-500/20 text-indigo-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                          {emp.role === 'internal_sales' ? 'Internal' :
                            emp.role === 'shop_manager' ? 'Manager' : 'External'}
                        </div>
                      </div>
                      <div className={`text-sm ${theme.text.muted}`}>{emp.email} • {emp.employment_percentage}%</div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                      {emp.role !== 'shop_manager' && (
                        <>
                          <div className="flex-1">
                            <Label className="text-xs text-slate-400 mb-1 block">Wireless Target</Label>
                            <Input
                              type="number"
                              className="h-8 bg-slate-900 border-slate-700 text-white"
                              value={localTargets[emp.id]?.wireless || 0}
                              onChange={e => setLocalTargets(prev => ({
                                ...prev,
                                [emp.id]: { ...prev[emp.id], wireless: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-slate-400 mb-1 block">Wireline Target</Label>
                            <Input
                              type="number"
                              className="h-8 bg-slate-900 border-slate-700 text-white"
                              value={localTargets[emp.id]?.wireline || 0}
                              onChange={e => setLocalTargets(prev => ({
                                ...prev,
                                [emp.id]: { ...prev[emp.id], wireline: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                        </>
                      )}

                      {emp.role === 'shop_manager' && (
                        <div className="flex flex-1 gap-4 items-end">
                          <div className="flex-1">
                            <Label className="text-xs text-slate-400 mb-1 block">YTD %</Label>
                            <Input
                              type="number"
                              className="h-8 bg-slate-900 border-slate-700 text-white"
                              value={localTargets[emp.id]?.shopManagerYtdPercentage || 0}
                              onChange={e => setLocalTargets(prev => ({
                                ...prev,
                                [emp.id]: { ...prev[emp.id], shopManagerYtdPercentage: parseInt(e.target.value) || 0 }
                              }))}
                            />
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="text-xs text-slate-400 mb-1">Estimated Bonus</div>
                            <div className="text-sm font-medium text-emerald-400">
                              {(() => {
                                const ytd = localTargets[emp.id]?.shopManagerYtdPercentage || 0
                                // Bonus logic: (min(YTD, 200) - 100) * 50. If YTD <= 100, bonus is 0.
                                const cappedYtd = Math.min(ytd, MANAGER_MAX_ZER)
                                const bonus = cappedYtd > 100 ? (cappedYtd - 100) * MANAGER_BONUS_PER_POINT : 0
                                return formatCurrency(bonus)
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        onClick={() => openEditModal(emp)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={() => handleDeleteUser(emp.id, emp.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
