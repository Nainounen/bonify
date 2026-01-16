import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getRegionsWithStats } from './actions'
import { DirectorView } from './director-view'

export default async function DirectorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check role using AdminClient to bypass RLS recursion issues
  if (user.email !== 'admin@admin.com') {
    const adminClient = createAdminClient()
    const { data: emp } = await adminClient.from('employees').select('role').eq('id', user.id).single()

    const role = (emp as any)?.role

    if (role !== 'director') {
    }
  }

  const { regions, error } = await getRegionsWithStats()

  if (error) {
    return <div className="p-8 text-red-500">Error loading director dashboard: {error}</div>
  }

  // Calculate totals for top stats
  const stats = {
    totalRegions: regions?.length || 0,
    totalManagers: regions?.filter((r: any) => r.manager).length || 0,
    totalSales: regions?.reduce((sum: number, r: any) => sum + (r.salesCount || 0), 0) || 0,
    totalShops: regions?.reduce((sum: number, r: any) => sum + (r.shopCount || 0), 0) || 0,
  }

  return (
    <DirectorView
      initialRegions={regions || []}
      stats={stats}
      user={user}
    />
  )
}
