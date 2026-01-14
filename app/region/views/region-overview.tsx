'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createShop, createShopManager } from '../actions'
import { toast } from 'sonner'
import { Plus, Store, UserPlus, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function RegionalOverview({ data }: { data: any }) {
  const [isCreateShopOpen, setIsCreateShopOpen] = useState(false)
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [newShopName, setNewShopName] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createShop(newShopName)
    setLoading(false)
    if (res.error) toast.error(res.error)
    else {
      toast.success('Shop created')
      setIsCreateShopOpen(false)
      setNewShopName('')
    }
  }

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShopId) return
    setLoading(true)
    const res = await createShopManager({
      name: managerName,
      email: managerEmail,
      password: managerPassword,
      shopId: selectedShopId
    })
    setLoading(false)
    if (res.error) toast.error(res.error)
    else {
      toast.success('Manager created')
      setIsCreateManagerOpen(false)
      setManagerName('')
      setManagerEmail('')
      setManagerPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {data.regionName} Region
            </h1>
            <p className="text-slate-400">Overview for {new Date(data.year, data.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          </div>
          <Dialog open={isCreateShopOpen} onOpenChange={setIsCreateShopOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> New Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Shop</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateShop} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Shop Name</Label>
                  <Input
                    value={newShopName}
                    onChange={e => setNewShopName(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Create Shop</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Wireless</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.totalWireless}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Wireline</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.totalWireline}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Shops</CardTitle>
              <Store className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.shops.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Shop Performance Comparison</CardTitle>
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
          <h2 className="text-xl font-semibold mb-4 text-white">Shop Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.shops.map((shop: any) => (
              <Card key={shop.id} className="bg-slate-800 border-slate-700 hover:border-slate-500 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-white font-semibold">{shop.name}</CardTitle>
                  <Store className="h-5 w-5 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Employees</span>
                      <span className="text-white font-medium">{shop.employees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Sales (This Month)</span>
                      <span className="text-white font-medium">{shop.wireless + shop.wireline}</span>
                    </div>

                    <Dialog open={isCreateManagerOpen && selectedShopId === shop.id} onOpenChange={(open) => {
                      setIsCreateManagerOpen(open)
                      if (!open) setSelectedShopId(null)
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600"
                          onClick={() => {
                            setSelectedShopId(shop.id)
                            setIsCreateManagerOpen(true)
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" /> Add Manager
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700 text-white">
                        <DialogHeader>
                          <DialogTitle>Add Manager for {shop.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateManager} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={managerName}
                              onChange={e => setManagerName(e.target.value)}
                              className="bg-slate-900 border-slate-700"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={managerEmail}
                              onChange={e => setManagerEmail(e.target.value)}
                              className="bg-slate-900 border-slate-700"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={managerPassword}
                              onChange={e => setManagerPassword(e.target.value)}
                              className="bg-slate-900 border-slate-700"
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>Create Manager</Button>
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
