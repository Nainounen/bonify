import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminStats, getUsers } from './actions'
import { AdminView } from './admin-view'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Strict email check for admin access
  if (user.email !== 'admin@admin.com') {
    redirect('/dashboard')
  }

  const { year, month } = await searchParams
  const y = year ? parseInt(year as string) : undefined
  const m = month ? parseInt(month as string) : undefined

  const [stats, users] = await Promise.all([
    getAdminStats(y, m),
    getUsers()
  ])

  return <AdminView stats={stats} users={users} />
}
