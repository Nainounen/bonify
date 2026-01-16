'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Add missing import at top if needed, assuming assignShopManager will go into app/region/actions.ts
// I'll append it to the end of the file or insert it.

export async function assignShopManager(params: {
  shopId: string
  employeeId: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Verify shop is in user's region (security check)
  const { data: requestingUser } = await adminClient.from('employees').select('region_id').eq('id', user.id).single()
  const requester = requestingUser as any

  const { data: shopData } = await adminClient.from('shops').select('region_id').eq('id', params.shopId).single()
  const shop = shopData as any

  if (!shop || shop.region_id !== requester?.region_id) {
    return { error: 'Unauthorized access to shop' }
  }

  // Update employee
  const { error } = await (adminClient.from('employees') as any)
    .update({
      role: 'shop_manager',
      shop_id: params.shopId
    })
    .eq('id', params.employeeId)

  if (error) return { error: error.message }

  revalidatePath('/region')
  return { success: true }
}
