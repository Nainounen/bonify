'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Trash2 } from 'lucide-react'
import { deleteUser } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type UsersListProps = {
  users: any[]
  theme: any
}

export function UsersList({ users, theme }: UsersListProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const router = useRouter()

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

  return (
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
  )
}
