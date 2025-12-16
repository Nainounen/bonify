/**
 * Standardized error handling wrapper for Server Actions
 */

type ActionResult<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string }

/**
 * Wraps a Server Action with consistent error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    console.error('Server Action error:', error)
    
    if (error instanceof Error) {
      return { error: error.message }
    }
    
    return { 
      error: errorMessage || 'An unexpected error occurred. Please try again.' 
    }
  }
}

/**
 * Validates data against a Zod schema
 */
export function validateOrError<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): ActionResult<T> {
  try {
    const validated = schema.parse(data)
    return { data: validated }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Validation failed' }
  }
}
