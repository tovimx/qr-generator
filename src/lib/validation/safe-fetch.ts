import { z } from 'zod'
import { APIErrorSchema } from './schemas'
import { assertNever } from './exhaustive-types'

/**
 * Type-safe fetch utility that validates response data at runtime
 * Replaces unsafe type assertions with runtime validation
 */
export async function safeFetch<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options)
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        const parsedError = APIErrorSchema.safeParse(errorData)
        
        if (parsedError.success) {
          errorMessage = parsedError.data.error
        } else if (errorData?.error) {
          errorMessage = errorData.error
        }
      } catch {
        // If we can't parse error JSON, use the status message
      }
      
      throw new FetchError(errorMessage, response.status)
    }
    
    // Parse and validate response JSON
    const json = await response.json()
    const result = schema.safeParse(json)
    
    if (!result.success) {
      throw new ValidationError(
        `Invalid response shape: ${result.error.message}`,
        result.error.issues,
        json
      )
    }
    
    return result.data
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof FetchError || error instanceof ValidationError) {
      throw error
    }
    
    // Wrap other errors
    throw new FetchError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    )
  }
}

/**
 * Custom error classes for better error handling
 */
export class FetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: Response
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly zodIssues: z.ZodIssue[],
    public readonly receivedData: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Safe JSON parsing utility
 */
export function safeJsonParse<T>(
  jsonString: string,
  schema: z.ZodSchema<T>
): T {
  try {
    const json = JSON.parse(jsonString)
    const result = schema.safeParse(json)
    
    if (!result.success) {
      throw new ValidationError(
        `Invalid JSON shape: ${result.error.message}`,
        result.error.issues,
        json
      )
    }
    
    return result.data
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error
    }
    
    throw new ValidationError(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      [],
      jsonString
    )
  }
}

/**
 * Type guard factory for runtime type checking
 */
export function createTypeGuard<T>(schema: z.ZodSchema<T>) {
  return (value: unknown): value is T => {
    const result = schema.safeParse(value)
    return result.success
  }
}

// Re-export assertNever for backward compatibility
export { assertNever }

/**
 * Type-safe environment variable accessor
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is not set`)
  }
  
  return value
}

/**
 * Type-safe array access with bounds checking
 */
export function safeArrayAccess<T>(
  array: readonly T[],
  index: number
): T | undefined {
  if (index < 0 || index >= array.length) {
    return undefined
  }
  return array[index]
}

/**
 * Type-safe object property access
 */
export function safePropAccess<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  return obj?.[key]
}