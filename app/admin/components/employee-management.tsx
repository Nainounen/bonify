'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Trash2, Save, Plus, Edit2, X, Target, Key } from 'lucide-react'
import { deleteUser, updateEmployee, getShops, setMonthlyTarget, createEmployee } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getCurrentPeriod } from '@/lib/bonus-calculator'

type EmployeeManagementProps = {
  users: any[]
  theme: any
}

export function EmployeeManagement({ users, theme }: EmployeeManagementProps) {
  const router = useRouter()
  const { year, month } = getCurrentPeriod()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [shops, setShops] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [targets, setTargets] = useState<Record<string, any>>({})
  const [creatingUser, setCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'internal_sales',
    employmentPercentage: 100,
    shopId: '',
  })

  useEffect(() => {
    loadShops()
    loadTargets()
  }, [])

  const loadShops = async () => {
    const result = await getShops()
    if (!result.error) {
      setShops(result.shops || [])
    }
  }

  const loadTargets = async () => {
    // Load current targets for all users
    const targetData: Record<string, any> = {}
    for (const user of users) {
      // This would need a new action to fetch targets
      targetData[user.id] = {
        wireless: 0,
        wireline: 0,
      }
    }
    setTargets(targetData)
  }

  const handleEdit = (user: any) => {
    setEditingId(user.id)
    setEditData({
      role: user.role || 'internal_sales',
      employmentPercentage: user.employment_percentage || 100,
      shopId: user.shop_id || '',
    })
  }

  const handleSaveEdit = async (userId: string) => {
    const result = await updateEmployee({
      employeeId: userId,
      role: editData.role,
      employmentPercentage: editData.employmentPercentage,
      shopId: editData.shopId || null,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Employee updated successfully')
      setEditingId(null)
      router.refresh()
    }
  }

  const handleSaveTarget = async (userId: string) => {
    const target = targets[userId]
    if (!target) return

    const result = await setMonthlyTarget({
      employeeId: userId,
      year,
      month,
      wirelessTarget: target.wireless,
      wirelineTarget: target.wireline,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Target updated successfully')
      router.refresh()
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This will also delete all their sales.`)) return

    const result = await deleteUser(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('User deleted successfully')
      router.refresh()
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields')
      return
    }

    setCreatingUser(true)
    const result = await createEmployee({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      employmentPercentage: newUser.employmentPercentage,
      shopId: newUser.shopId || null,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Employee created successfully')
      setShowCreateForm(false)
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'internal_sales',
        employmentPercentage: 100,
        shopId: '',
      })
      router.refresh()
    }
    setCreatingUser(false)
  }

  return (
    <div className="space-y-4">
      {/* Header with Add User Button */}
      <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`${theme.text.primary} flex items-center gap-2`}>
              <Users className="h-5 w-5" /> Employee Management ({users.length})
            </CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
              className="gap-2"
            >
              {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreateForm ? 'Cancel' : 'Add Employee'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
          <CardHeader>
            <CardTitle className={`${theme.text.primary} text-lg`}>Create New Employee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_sales">Internal Sales</SelectItem>
                    <SelectItem value="external_sales">External Sales</SelectItem>
                    <SelectItem value="shop_manager">Shop Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Employment %</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={newUser.employmentPercentage}
                  onChange={(e) => setNewUser({ ...newUser, employmentPercentage: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div>
                <Label>Shop</Label>
                <Select value={newUser.shopId} onValueChange={(value) => setNewUser({ ...newUser, shopId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateUser} disabled={creatingUser} className="w-full">
              {creatingUser ? 'Creating...' : 'Create Employee'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Employee Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {users.map((user) => {
          const isEditing = editingId === user.id
          const currentData = isEditing ? editData : {
            role: user.role || 'internal_sales',
            employmentPercentage: user.employment_percentage || 100,
            shopId: user.shop_id || '',
          }

          return (
            <Card key={user.id} className={`${theme.card} backdrop-blur-xl border ${theme.cardBorder}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className={`${theme.text.primary} text-lg`}>{user.name}</CardTitle>
                    <p className={`text-sm ${theme.text.muted} mt-1`}>{user.email}</p>
                  </div>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveEdit(user.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Role and Employment */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Role</Label>
                    {isEditing ? (
                      <Select
                        value={currentData.role}
                        onValueChange={(value) => setEditData({ ...editData, role: value })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal_sales">Internal Sales</SelectItem>
                          <SelectItem value="external_sales">External Sales</SelectItem>
                          <SelectItem value="shop_manager">Shop Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`text-sm ${theme.text.primary} mt-1`}>
                        {currentData.role === 'shop_manager' ? 'Shop Manager' : currentData.role === 'internal_sales' ? 'Internal Sales' : 'External Sales'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Employment %</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={currentData.employmentPercentage}
                        onChange={(e) => setEditData({ ...editData, employmentPercentage: parseInt(e.target.value) || 100 })}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <div className={`text-sm ${theme.text.primary} mt-1`}>{currentData.employmentPercentage}%</div>
                    )}
                  </div>
                </div>

                {/* Shop */}
                <div>
                  <Label className="text-xs">Shop</Label>
                  {isEditing ? (
                    <Select
                      value={currentData.shopId}
                      onValueChange={(value) => setEditData({ ...editData, shopId: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {shops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className={`text-sm ${theme.text.primary} mt-1`}>
                      {shops.find(s => s.id === currentData.shopId)?.name || 'None'}
                    </div>
                  )}
                </div>

                {/* Monthly Targets */}
                {currentData.role !== 'shop_manager' && (
                  <div className={`pt-3 border-t ${theme.cardInactiveBorder}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })} Targets
                      </Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveTarget(user.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Wireless"
                          value={targets[user.id]?.wireless ?? ''}
                          onChange={(e) => setTargets({
                            ...targets,
                            [user.id]: {
                              ...targets[user.id],
                              wireless: parseInt(e.target.value) || 0,
                            }
                          })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Wireline"
                          value={targets[user.id]?.wireline ?? ''}
                          onChange={(e) => setTargets({
                            ...targets,
                            [user.id]: {
                              ...targets[user.id],
                              wireline: parseInt(e.target.value) || 0,
                            }
                          })}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
