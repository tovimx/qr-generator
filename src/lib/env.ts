/**
 * Environment Variable Utilities
 * 
 * Centralized, type-safe environment variable access with production compatibility.
 * Handles both development and production environments consistently.
 */

/**
 * Type-safe environment variable getter with fallbacks
 * Uses direct property access for better bundler compatibility in production
 */
export function getEnvVar(key: string, fallback?: string): string {
  // Direct property access prevents issues with dynamic key access in production bundles
  const env = process.env
  const value = env[key as keyof typeof env]
  
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(`Environment variable ${key} is not defined`)
  }
  
  return value
}

/**
 * Get required environment variable (throws if missing)
 */
export function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key)
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable ${key} is required but empty`)
  }
  return value
}

/**
 * Get optional environment variable with default
 */
export function getOptionalEnvVar(key: string, defaultValue: string): string {
  try {
    const value = getEnvVar(key)
    return value || defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Environment variable constants for type safety
 */
export const ENV = {
  // Supabase
  SUPABASE_URL: () => getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: () => getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: () => getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  
  // App URLs
  APP_URL: () => getOptionalEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  SITE_URL: () => getOptionalEnvVar('NEXT_PUBLIC_SITE_URL', ''),
  
  // Database
  DATABASE_URL: () => getRequiredEnvVar('DATABASE_URL'),
  DIRECT_DATABASE_URL: () => getOptionalEnvVar('DIRECT_DATABASE_URL', ''),
  
  // Node environment
  NODE_ENV: () => getOptionalEnvVar('NODE_ENV', 'development'),
  
  // CI/Production flags
  CI: () => getOptionalEnvVar('CI', 'false') === 'true',
} as const

/**
 * Check if all required environment variables are present
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ]
  
  const missing = required.filter(key => {
    try {
      getRequiredEnvVar(key)
      return false
    } catch {
      return true
    }
  })
  
  return {
    valid: missing.length === 0,
    missing
  }
}