'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validation'
import { withErrorHandling, validateOrError } from '@/lib/error-handling'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate input
  const validation = validateOrError(loginSchema, data)
  if (validation.error) {
    return { error: validation.error }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  if (data.email === 'list@admin.com') {
    redirect('/list')
  }

  if (data.email === 'admin@admin.com') {
    redirect('/admin')
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const inputData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate input
  const validation = validateOrError(signupSchema, inputData)
  if (validation.error) {
    return { error: validation.error }
  }

  const data = {
    email: inputData.email,
    password: inputData.password,
    options: {
      data: {
        name: inputData.name,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
