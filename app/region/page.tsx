import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRegionalOverview } from './actions'
import { RegionalOverview } from './views/region-overview'

export default async function RegionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify role using admin client to avoid RLS issues
  const adminClient = createAdminClient()
  const { data: employeeData } = await adminClient
    .from('employees')
    .select('role, name, email')
    .eq('id', user.id)
    .single()

  const employee = employeeData as any

  if (employee?.role !== 'regional_manager') {
    redirect('/dashboard')
  }

  const overviewData = await getRegionalOverview()

  if ('error' in overviewData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Region</h1>
          <p>{overviewData.error}</p>
        </div>
      </div>
    )
  }

  return <RegionalOverview data={overviewData} user={employee} />
}
