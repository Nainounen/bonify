'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Save, Trash2, Target, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createShopEmployee, deleteShopEmployee, setShopEmployeeTarget } from '@/app/dashboard/shop-manager-actions'

type ShopManagementTabProps = {
  employees: any[]
  targets: any[]
  theme: any
}

export function ShopManagementTab({ employees, targets, theme }: ShopManagementTabProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // New User Form keys
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'internal_sales' | 'external_sales'>('internal_sales')
  const [newEmploymentPercentage, setNewEmploymentPercentage] = useState(100)

  // Targets state
  const [localTargets, setLocalTargets] = useState<Record<string, { wireless: number, wireline: number }>>(() => {
    const initial: any = {}
    employees.forEach(emp => {
      const t = targets.find(t => t.employee_id === emp.id)
      initial[emp.id] = {
        wireless: t?.wireless_target || 0,
        wireline: t?.wireline_target || 0
      }
    })
    return initial
  })

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
      setNewName('')
      setNewEmail('')
      setNewPassword('')
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
          wirelineTarget: target.wireline
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

  return (
    <div className="space-y-6">
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
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
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
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
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
                    <Input type="number" min="0" max="100" value={newEmploymentPercentage} onChange={e => setNewEmploymentPercentage(parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Create Employee</Button>
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
                        <div className={`text-xs px-2 py-0.5 rounded-full ${emp.role === 'internal_sales' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {emp.role === 'internal_sales' ? 'Internal' : 'External'}
                        </div>
                      </div>
                      <div className={`text-sm ${theme.text.muted}`}>{emp.email} • {emp.employment_percentage}%</div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
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
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      onClick={() => handleDeleteUser(emp.id, emp.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
