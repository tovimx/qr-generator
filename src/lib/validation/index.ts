/**
 * Validation Library Index
 * 
 * Centralized exports for all validation utilities including:
 * - Runtime validation with Zod
 * - Type-safe fetch utilities
 * - Branded types for ID safety
 * - Exhaustive type checking
 * - Enhanced error handling
 * - Migration utilities
 */

// Core validation utilities
export * from './safe-fetch'
export * from './schemas'

// Branded types system
export * from './branded-types'
export * from './branded-schemas'
export * from './branded-migration'

// Advanced type checking
export * from './exhaustive-types'

// Error handling (override ValidationError from safe-fetch with comprehensive version)
export * from './error-handling'
export type { ValidationError } from './error-handling'

// Re-export commonly used Zod utilities
export { z } from 'zod'

/**
 * Validation presets for common use cases
 */
export const ValidationPresets = {
  // 2025 TypeScript strict mode compliance
  strictMode: {
    exactOptionalPropertyTypes: true,
    noUncheckedIndexedAccess: true,
    useUnknownInCatchVariables: true,
  },
  
  // Runtime validation best practices
  runtime: {
    validateInputs: true,
    validateOutputs: true,
    failFast: false,
    detailedErrors: true,
  },
  
  // API safety defaults
  api: {
    timeoutMs: 10000,
    retries: 3,
    validateResponses: true,
    brandedIds: true,
  },
} as const