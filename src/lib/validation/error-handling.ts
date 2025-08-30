/**
 * Enhanced Error Handling with Discriminated Unions
 * 
 * This module provides a comprehensive error handling system using discriminated
 * unions for type-safe error management. It includes domain-specific error types,
 * error boundaries, and utilities for consistent error handling across the application.
 */

import { z } from 'zod'
import { assertNever } from './exhaustive-types'
import type { QRCodeId, ProjectId, DomainId } from './branded-types'

/**
 * Base error interface for all application errors
 */
interface BaseError {
  readonly kind: string
  readonly message: string
  readonly timestamp: Date
  readonly context?: Record<string, unknown> | undefined
  readonly cause?: Error | undefined
}

/**
 * Validation errors from Zod schema validation
 */
export interface ValidationError extends BaseError {
  readonly kind: 'ValidationError'
  readonly zodError: z.ZodError
  readonly fieldErrors: Record<string, string[]>
}

/**
 * Network/HTTP errors from API calls
 */
export interface NetworkError extends BaseError {
  readonly kind: 'NetworkError'
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly method: string
}

/**
 * Authentication/Authorization errors
 */
export interface AuthError extends BaseError {
  readonly kind: 'AuthError'
  readonly authType: 'authentication' | 'authorization'
  readonly requiredRole?: string | undefined
  readonly userRole?: string | undefined
}

/**
 * Business logic errors - domain-specific
 */
export interface BusinessError extends BaseError {
  readonly kind: 'BusinessError'
  readonly code: BusinessErrorCode
  readonly details: Record<string, unknown>
}

/**
 * Database/Persistence errors
 */
export interface DatabaseError extends BaseError {
  readonly kind: 'DatabaseError'
  readonly operation: 'create' | 'read' | 'update' | 'delete'
  readonly table?: string | undefined
  readonly constraint?: string | undefined
}

/**
 * Resource not found errors
 */
export interface NotFoundError extends BaseError {
  readonly kind: 'NotFoundError'
  readonly resourceType: ResourceType
  readonly resourceId: string
  readonly searchCriteria?: Record<string, unknown> | undefined
}

/**
 * Conflict errors (e.g., duplicate resources)
 */
export interface ConflictError extends BaseError {
  readonly kind: 'ConflictError'
  readonly conflictType: ConflictType
  readonly existingResource?: Record<string, unknown> | undefined
  readonly attemptedResource?: Record<string, unknown> | undefined
}

/**
 * Rate limiting errors
 */
export interface RateLimitError extends BaseError {
  readonly kind: 'RateLimitError'
  readonly limit: number
  readonly remaining: number
  readonly resetTime: Date
  readonly retryAfter: number
}

/**
 * Configuration errors
 */
export interface ConfigError extends BaseError {
  readonly kind: 'ConfigError'
  readonly configKey: string
  readonly expectedType: string
  readonly actualValue?: unknown
}

/**
 * Unknown/Unexpected errors
 */
export interface UnknownError extends BaseError {
  readonly kind: 'UnknownError'
  readonly originalError: Error
  readonly stack?: string | undefined
}

/**
 * Union type of all possible application errors
 */
export type AppError = 
  | ValidationError
  | NetworkError
  | AuthError
  | BusinessError
  | DatabaseError
  | NotFoundError
  | ConflictError
  | RateLimitError
  | ConfigError
  | UnknownError

/**
 * Business error codes for domain-specific errors
 */
export type BusinessErrorCode = 
  | 'QR_CODE_LIMIT_EXCEEDED'
  | 'PROJECT_LIMIT_EXCEEDED'
  | 'DOMAIN_ALREADY_VERIFIED'
  | 'DOMAIN_VERIFICATION_FAILED'
  | 'INVALID_QR_CODE_REDIRECT'
  | 'LOGO_UPLOAD_FAILED'
  | 'LOGO_SIZE_EXCEEDED'
  | 'INVALID_REDIRECT_URL'
  | 'PROJECT_NOT_EMPTY'
  | 'DEFAULT_PROJECT_CANNOT_DELETE'
  | 'SUBSCRIPTION_REQUIRED'
  | 'FEATURE_NOT_AVAILABLE'

/**
 * Resource types for NotFoundError
 */
export type ResourceType = 
  | 'qr-code'
  | 'project' 
  | 'domain'
  | 'user'
  | 'client'
  | 'link'
  | 'analytics'

/**
 * Conflict types for ConflictError
 */
export type ConflictType =
  | 'duplicate-shortcode'
  | 'duplicate-domain'
  | 'duplicate-project-name'
  | 'primary-domain-exists'
  | 'resource-in-use'

/**
 * Error factory functions for creating typed errors
 */
export const createValidationError = (
  message: string,
  zodError: z.ZodError,
  context?: Record<string, unknown>
): ValidationError => {
  const fieldErrors: Record<string, string[]> = {}
  
  zodError.issues.forEach((issue: z.ZodIssue) => {
    const path = issue.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(issue.message)
  })

  return {
    kind: 'ValidationError',
    message,
    timestamp: new Date(),
    context,
    zodError,
    fieldErrors,
  }
}

export const createNetworkError = (
  message: string,
  status: number,
  statusText: string,
  url: string,
  method: string,
  context?: Record<string, unknown>
): NetworkError => ({
  kind: 'NetworkError',
  message,
  timestamp: new Date(),
  context,
  status,
  statusText,
  url,
  method,
})

export const createAuthError = (
  message: string,
  authType: 'authentication' | 'authorization',
  requiredRole?: string,
  userRole?: string,
  context?: Record<string, unknown>
): AuthError => ({
  kind: 'AuthError',
  message,
  timestamp: new Date(),
  context,
  authType,
  requiredRole,
  userRole,
})

export const createBusinessError = (
  message: string,
  code: BusinessErrorCode,
  details: Record<string, unknown>,
  context?: Record<string, unknown>
): BusinessError => ({
  kind: 'BusinessError',
  message,
  timestamp: new Date(),
  context,
  code,
  details,
})

export const createDatabaseError = (
  message: string,
  operation: DatabaseError['operation'],
  table?: string,
  constraint?: string,
  context?: Record<string, unknown>
): DatabaseError => ({
  kind: 'DatabaseError',
  message,
  timestamp: new Date(),
  context,
  operation,
  table,
  constraint,
})

export const createNotFoundError = (
  resourceType: ResourceType,
  resourceId: string,
  searchCriteria?: Record<string, unknown>,
  context?: Record<string, unknown>
): NotFoundError => ({
  kind: 'NotFoundError',
  message: `${resourceType} with ID ${resourceId} not found`,
  timestamp: new Date(),
  context,
  resourceType,
  resourceId,
  searchCriteria,
})

export const createConflictError = (
  message: string,
  conflictType: ConflictType,
  existingResource?: Record<string, unknown>,
  attemptedResource?: Record<string, unknown>,
  context?: Record<string, unknown>
): ConflictError => ({
  kind: 'ConflictError',
  message,
  timestamp: new Date(),
  context,
  conflictType,
  existingResource,
  attemptedResource,
})

export const createRateLimitError = (
  message: string,
  limit: number,
  remaining: number,
  resetTime: Date,
  retryAfter: number,
  context?: Record<string, unknown>
): RateLimitError => ({
  kind: 'RateLimitError',
  message,
  timestamp: new Date(),
  context,
  limit,
  remaining,
  resetTime,
  retryAfter,
})

export const createConfigError = (
  message: string,
  configKey: string,
  expectedType: string,
  actualValue?: unknown,
  context?: Record<string, unknown>
): ConfigError => ({
  kind: 'ConfigError',
  message,
  timestamp: new Date(),
  context,
  configKey,
  expectedType,
  actualValue,
})

export const createUnknownError = (
  message: string,
  originalError: Error,
  context?: Record<string, unknown>
): UnknownError => ({
  kind: 'UnknownError',
  message,
  timestamp: new Date(),
  context,
  originalError,
  stack: originalError.stack,
})

/**
 * Error conversion utilities
 */
export const fromError = (error: unknown, context?: Record<string, unknown>): AppError => {
  if (error instanceof z.ZodError) {
    return createValidationError('Validation failed', error, context)
  }
  
  if (error instanceof Error) {
    // Check if it's already an AppError
    if (isAppError(error)) {
      return error
    }
    
    return createUnknownError(
      error.message || 'An unknown error occurred',
      error,
      context
    )
  }
  
  return createUnknownError(
    'An unknown error occurred',
    new Error(String(error)),
    context
  )
}

export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    'message' in error &&
    'timestamp' in error
  )
}

/**
 * Error matching utilities for exhaustive error handling
 */
export const matchError = <T>(error: AppError) => ({
  validation: (handler: (error: ValidationError) => T) => ({
    network: (networkHandler: (error: NetworkError) => T) => ({
      auth: (authHandler: (error: AuthError) => T) => ({
        business: (businessHandler: (error: BusinessError) => T) => ({
          database: (databaseHandler: (error: DatabaseError) => T) => ({
            notFound: (notFoundHandler: (error: NotFoundError) => T) => ({
              conflict: (conflictHandler: (error: ConflictError) => T) => ({
                rateLimit: (rateLimitHandler: (error: RateLimitError) => T) => ({
                  config: (configHandler: (error: ConfigError) => T) => ({
                    unknown: (unknownHandler: (error: UnknownError) => T): T => {
                      switch (error.kind) {
                        case 'ValidationError':
                          return handler(error)
                        case 'NetworkError':
                          return networkHandler(error)
                        case 'AuthError':
                          return authHandler(error)
                        case 'BusinessError':
                          return businessHandler(error)
                        case 'DatabaseError':
                          return databaseHandler(error)
                        case 'NotFoundError':
                          return notFoundHandler(error)
                        case 'ConflictError':
                          return conflictHandler(error)
                        case 'RateLimitError':
                          return rateLimitHandler(error)
                        case 'ConfigError':
                          return configHandler(error)
                        case 'UnknownError':
                          return unknownHandler(error)
                        default:
                          return assertNever(error) as T
                      }
                    }
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

/**
 * Simplified error matching for common cases
 */
export const handleError = (error: AppError): string => {
  return matchError<string>(error)
    .validation(() => 'Please check your input and try again')
    .network(() => 'Network error. Please check your connection')
    .auth(() => 'Authentication required')
    .business((e) => e.message)
    .database(() => 'Database error. Please try again')
    .notFound(() => 'Resource not found')
    .conflict(() => 'Conflict with existing resource')
    .rateLimit(() => 'Too many requests. Please try again later')
    .config(() => 'Configuration error')
    .unknown(() => 'An unexpected error occurred')
}

/**
 * Error boundary utilities for React components
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error?: AppError
}

export const getErrorDisplayInfo = (error: AppError) => {
  const baseInfo = {
    timestamp: error.timestamp,
    context: error.context,
  }

  return matchError(error)
    .validation((e) => ({
      ...baseInfo,
      title: 'Validation Error',
      message: 'Please check your input and try again',
      fields: e.fieldErrors,
      canRetry: true,
    }))
    .network((e) => ({
      ...baseInfo,
      title: 'Network Error',
      message: `${e.status} ${e.statusText}`,
      canRetry: e.status >= 500,
    }))
    .auth(() => ({
      ...baseInfo,
      title: 'Authentication Required',
      message: 'Please sign in to continue',
      canRetry: false,
    }))
    .business((e) => ({
      ...baseInfo,
      title: 'Error',
      message: e.message,
      code: e.code,
      canRetry: false,
    }))
    .database(() => ({
      ...baseInfo,
      title: 'Database Error',
      message: 'Please try again',
      canRetry: true,
    }))
    .notFound((e) => ({
      ...baseInfo,
      title: 'Not Found',
      message: `${e.resourceType} not found`,
      canRetry: false,
    }))
    .conflict(() => ({
      ...baseInfo,
      title: 'Conflict',
      message: 'Resource already exists',
      canRetry: false,
    }))
    .rateLimit((e) => ({
      ...baseInfo,
      title: 'Rate Limited',
      message: 'Too many requests',
      retryAfter: e.retryAfter,
      canRetry: true,
    }))
    .config(() => ({
      ...baseInfo,
      title: 'Configuration Error',
      message: 'Please contact support',
      canRetry: false,
    }))
    .unknown(() => ({
      ...baseInfo,
      title: 'Unexpected Error',
      message: 'Something went wrong',
      canRetry: true,
    }))
}

/**
 * Domain-specific error utilities
 */
export const QRCodeErrors = {
  limitExceeded: (limit: number) => createBusinessError(
    `Cannot create more than ${limit} QR codes`,
    'QR_CODE_LIMIT_EXCEEDED',
    { limit }
  ),
  
  invalidRedirect: (url: string) => createBusinessError(
    'Invalid redirect URL',
    'INVALID_QR_CODE_REDIRECT',
    { url }
  ),
  
  notFound: (id: QRCodeId) => createNotFoundError('qr-code', id),
}

export const ProjectErrors = {
  limitExceeded: (limit: number) => createBusinessError(
    `Cannot create more than ${limit} projects`,
    'PROJECT_LIMIT_EXCEEDED',
    { limit }
  ),
  
  notEmpty: (qrCodeCount: number) => createBusinessError(
    'Cannot delete project with QR codes',
    'PROJECT_NOT_EMPTY',
    { qrCodeCount }
  ),
  
  cannotDeleteDefault: () => createBusinessError(
    'Cannot delete default project',
    'DEFAULT_PROJECT_CANNOT_DELETE',
    {}
  ),
  
  notFound: (id: ProjectId) => createNotFoundError('project', id),
}

export const DomainErrors = {
  alreadyVerified: (hostname: string) => createBusinessError(
    'Domain already verified',
    'DOMAIN_ALREADY_VERIFIED',
    { hostname }
  ),
  
  verificationFailed: (hostname: string, reason: string) => createBusinessError(
    'Domain verification failed',
    'DOMAIN_VERIFICATION_FAILED',
    { hostname, reason }
  ),
  
  notFound: (id: DomainId) => createNotFoundError('domain', id),
  
  duplicateHostname: (hostname: string) => createConflictError(
    'Domain already exists',
    'duplicate-domain',
    undefined,
    { hostname }
  ),
}

/**
 * Result wrapper for error handling
 */
export type ErrorResult<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError }

export const successResult = <T>(data: T): ErrorResult<T> => ({
  success: true,
  data,
})

export const errorResult = <T>(error: AppError): ErrorResult<T> => ({
  success: false,
  error,
})

export const fromPromise = async <T>(
  promise: Promise<T>,
  context?: Record<string, unknown>
): Promise<ErrorResult<T>> => {
  try {
    const data = await promise
    return successResult(data)
  } catch (error) {
    return errorResult(fromError(error, context))
  }
}

/**
 * Error logging utilities
 */
export const logError = (error: AppError, logger?: (message: string, data: unknown) => void) => {
  const log = logger || console.error
  
  const logData = {
    kind: error.kind,
    message: error.message,
    timestamp: error.timestamp,
    context: error.context,
  }
  
  matchError(error)
    .validation((e) => log('Validation Error', { ...logData, fieldErrors: e.fieldErrors }))
    .network((e) => log('Network Error', { ...logData, status: e.status, url: e.url }))
    .auth((e) => log('Auth Error', { ...logData, authType: e.authType }))
    .business((e) => log('Business Error', { ...logData, code: e.code, details: e.details }))
    .database((e) => log('Database Error', { ...logData, operation: e.operation, table: e.table }))
    .notFound((e) => log('Not Found Error', { ...logData, resourceType: e.resourceType }))
    .conflict((e) => log('Conflict Error', { ...logData, conflictType: e.conflictType }))
    .rateLimit((e) => log('Rate Limit Error', { ...logData, limit: e.limit }))
    .config((e) => log('Config Error', { ...logData, configKey: e.configKey }))
    .unknown((e) => log('Unknown Error', { ...logData, stack: e.stack }))
}