'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Users, Wifi, Smartphone, AlertTriangle } from 'lucide-react'
import { deleteAllSales, deleteUser } from './actions'
import { toast } from 'sonner'
import { signOut } from '@/app/login/actions'

type AdminViewProps = {
  stats: {
    internet: number
    mobile: number
    total: number
  }
  users: any[]
}

export function AdminView({ stats, users }: AdminViewProps) {
  const [isDeletingSales, setIsDeletingSales] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const handleDeleteAllSales = async () => {
    if (!confirm('Are you sure you want to DELETE ALL SALES? This cannot be undone.')) return

    setIsDeletingSales(true)
    const result = await deleteAllSales()
    setIsDeletingSales(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('All sales deleted successfully')
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
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <form action={signOut}>
            <Button variant="outline" className="text-black">Sign Out</Button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-indigo-950/30 border-indigo-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                <Wifi className="h-4 w-4" /> Internet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-400">{stats.internet}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-950/30 border-purple-500/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> Mobile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-400">{stats.mobile}</div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="bg-red-950/10 border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-red-200/60">
              Irreversible actions. Proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAllSales}
              disabled={isDeletingSales}
              className="w-full sm:w-auto"
            >
              {isDeletingSales ? 'Deleting...' : 'Delete All Sales Database'}
            </Button>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" /> Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-sm text-slate-400">{user.email}</div>
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
                <div className="text-center text-slate-500 py-8">No users found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
