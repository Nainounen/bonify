'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Undo the last sale for the current user
 */
export async function undoLastSale() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get the most recent sale
  const { data, error: fetchError } = await supabase
    .from('sales')
    .select('id, created_at')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError || !data) {
    return { error: 'No recent sale to undo' }
  }

  const lastSale = data as { id: number; created_at: string }

  // Check if sale is within undo window (30 seconds)
  // const saleTime = new Date(lastSale.created_at).getTime()
  // const now = Date.now()
  // const thirtySeconds = 30 * 1000

  // if (now - saleTime > thirtySeconds) {
  //   return { error: 'Can only undo sales within 30 seconds' }
  // }

  // Delete the sale
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('id', lastSale.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
