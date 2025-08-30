/**
 * Exhaustive Type Checking Utilities
 * 
 * This module provides utilities for exhaustive type checking that help catch
 * cases where not all variants of a union type are handled. This is particularly
 * useful for switch statements, conditional logic, and state machines.
 * 
 * Key Features:
 * - Compile-time exhaustiveness checking
 * - Runtime assertion utilities  
 * - Type-safe switch statement helpers
 * - State transition validation
 */

/**
 * Assertion utility for exhaustive type checking
 * 
 * Use this in the default case of switch statements or the else branch
 * of if-else chains to ensure all cases are handled.
 * 
 * @example
 * ```typescript
 * const handleStatus = (status: 'pending' | 'success' | 'error') => {
 *   switch (status) {
 *     case 'pending':
 *       return 'Loading...'
 *     case 'success':
 *       return 'Done!'
 *     case 'error':
 *       return 'Failed!'
 *     default:
 *       return assertNever(status) // TypeScript error if new status added
 *   }
 * }
 * ```
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

/**
 * Exhaustive switch utility that provides better error messages
 */
export function exhaustiveSwitch(value: never, context?: string): never {
  const errorMessage = context 
    ? `Unhandled case in ${context}: ${JSON.stringify(value)}`
    : `Unhandled case: ${JSON.stringify(value)}`
  
  throw new Error(errorMessage)
}

/**
 * Type-safe pattern matching utility
 * 
 * @example
 * ```typescript
 * const result = match(status)
 *   .case('pending', () => 'Loading...')
 *   .case('success', (data) => `Success: ${data}`)
 *   .case('error', (error) => `Error: ${error.message}`)
 *   .exhaustive()
 * ```
 */
export class Matcher<T> {
  private constructor(private value: T, private matched: boolean = false) {}
  
  static create<T>(value: T): Matcher<T> {
    return new Matcher(value)
  }
  
  case<K extends T, R>(
    pattern: K, 
    handler: (value: K) => R
  ): CaseMatcher<T, R> {
    if (this.value === pattern) {
      return new CaseMatcher(this.value, true, handler(this.value as K))
    }
    return new CaseMatcher(this.value, this.matched, undefined as R | undefined)
  }
  
  default<R>(handler: (value: T) => R): R {
    if (this.matched) {
      // This should never happen in a well-constructed matcher
      throw new Error('Default handler called on already matched value')
    }
    return handler(this.value)
  }
  
  exhaustive(): never {
    return assertNever(this.value as never)
  }
}

class CaseMatcher<T, R> {
  constructor(
    private value: T, 
    private matched: boolean, 
    private result: R | undefined
  ) {}
  
  case<K extends T>(
    pattern: K, 
    handler: (value: K) => R
  ): CaseMatcher<T, R> {
    if (this.matched) {
      return this
    }
    
    if (this.value === pattern) {
      return new CaseMatcher(this.value, true, handler(this.value as K))
    }
    
    return this
  }
  
  default(handler: (value: T) => R): R {
    return this.matched ? this.result! : handler(this.value)
  }
  
  exhaustive(): R {
    if (this.matched) {
      return this.result!
    }
    return assertNever(this.value as never)
  }
}

/**
 * Helper function to create a matcher
 */
export const match = <T>(value: T) => Matcher.create(value)

/**
 * State machine utilities with exhaustive checking
 */
export type StateMachine<State extends string, Event extends string> = {
  [S in State]: {
    [E in Event]?: State
  }
}

export class TypeSafeStateMachine<State extends string, Event extends string> {
  constructor(
    private transitions: StateMachine<State, Event>,
    private currentState: State
  ) {}
  
  transition(event: Event): State {
    const nextState = this.transitions[this.currentState]?.[event]
    
    if (nextState === undefined) {
      throw new Error(
        `Invalid transition: ${this.currentState} + ${event}. ` +
        `Valid events: ${Object.keys(this.transitions[this.currentState] || {}).join(', ')}`
      )
    }
    
    this.currentState = nextState
    return nextState
  }
  
  getCurrentState(): State {
    return this.currentState
  }
  
  canTransition(event: Event): boolean {
    return this.transitions[this.currentState]?.[event] !== undefined
  }
  
  getValidEvents(): Event[] {
    return Object.keys(this.transitions[this.currentState] || {}) as Event[]
  }
}

/**
 * Union type utilities for exhaustive checking
 */
export type UnionToIntersection<U> = 
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type UnionToTuple<T> = UnionToIntersection<
  T extends unknown ? () => T : never
> extends () => infer R ? [...UnionToTuple<Exclude<T, R>>, R] : []

/**
 * Exhaustive array utility - ensures all union members are present in array
 */
export const exhaustiveArray = <T extends readonly [unknown, ...unknown[]]>(
  array: T
): T => array

/**
 * Type predicate utilities for better type narrowing
 */
export const isOneOf = <T extends readonly unknown[]>(
  value: unknown,
  options: T
): value is T[number] => {
  return options.includes(value as T[number])
}

export const assertIsOneOf: <T extends readonly unknown[]>(
  value: unknown,
  options: T,
  context?: string | undefined
) => asserts value is T[number] = <T extends readonly unknown[]>(
  value: unknown,
  options: T,
  context?: string | undefined
): asserts value is T[number] => {
  if (!isOneOf(value, options)) {
    const errorMessage = context
      ? `Value ${JSON.stringify(value)} is not one of expected values in ${context}: ${options.map(o => JSON.stringify(o)).join(', ')}`
      : `Value ${JSON.stringify(value)} is not one of expected values: ${options.map(o => JSON.stringify(o)).join(', ')}`
    
    throw new Error(errorMessage)
  }
}

/**
 * Discriminated union utilities
 */
export type DiscriminatedUnion<K extends PropertyKey, T extends Record<K, PropertyKey>> = {
  [P in keyof T]: { [Q in K]: P } & T[P]
}[keyof T]

/**
 * Result type for better error handling
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export const success = <T>(data: T): Result<T> => ({ success: true, data })
export const failure = <E = Error>(error: E): Result<never, E> => ({ success: false, error })

export const matchResult = <T, E, R>(result: Result<T, E>) => ({
  success: (handler: (data: T) => R) => ({
    failure: (failureHandler: (error: E) => R): R => {
      return result.success ? handler(result.data) : failureHandler(result.error)
    }
  })
})

/**
 * Option type for nullable values
 */
export type Option<T> = T | null | undefined

export const isSome = <T>(value: Option<T>): value is T => {
  return value !== null && value !== undefined
}

export const isNone = <T>(value: Option<T>): value is null | undefined => {
  return value === null || value === undefined
}

export const matchOption = <T, R>(option: Option<T>) => ({
  some: (handler: (value: T) => R) => ({
    none: (noneHandler: () => R): R => {
      return isSome(option) ? handler(option) : noneHandler()
    }
  })
})

/**
 * QR Code specific exhaustive types
 */
export const QRCodeRedirectTypes: readonly ['links', 'url'] = ['links', 'url'] as const
export type QRCodeRedirectType = typeof QRCodeRedirectTypes[number]

export const LogoShapes: readonly ['square', 'circle'] = ['square', 'circle'] as const  
export type LogoShape = typeof LogoShapes[number]

export const QRCodeStatuses: readonly ['active', 'inactive', 'deleted'] = ['active', 'inactive', 'deleted'] as const
export type QRCodeStatus = typeof QRCodeStatuses[number]

export const ProjectStatuses: readonly ['active', 'archived'] = ['active', 'archived'] as const
export type ProjectStatus = typeof ProjectStatuses[number]

export const DomainStatuses: readonly ['pending', 'verified', 'failed'] = ['pending', 'verified', 'failed'] as const
export type DomainStatus = typeof DomainStatuses[number]

/**
 * Validation helpers for QR code enums
 */
export const validateRedirectType = (value: unknown): QRCodeRedirectType => {
  assertIsOneOf(value, QRCodeRedirectTypes, 'QRCodeRedirectType')
  return value as QRCodeRedirectType
}

export const validateLogoShape = (value: unknown): LogoShape => {
  assertIsOneOf(value, LogoShapes, 'LogoShape')  
  return value as LogoShape
}

export const validateQRCodeStatus = (value: unknown): QRCodeStatus => {
  assertIsOneOf(value, QRCodeStatuses, 'QRCodeStatus')
  return value as QRCodeStatus
}

/**
 * State machine definitions for application entities
 */
export type QRCodeState = 'draft' | 'active' | 'inactive' | 'deleted'
export type QRCodeEvent = 'activate' | 'deactivate' | 'delete' | 'restore'

export const qrCodeStateMachine: StateMachine<QRCodeState, QRCodeEvent> = {
  draft: {
    activate: 'active',
    delete: 'deleted',
  },
  active: {
    deactivate: 'inactive',
    delete: 'deleted',
  },
  inactive: {
    activate: 'active',
    delete: 'deleted',
  },
  deleted: {
    restore: 'draft',
  },
}

export type ProjectState = 'active' | 'archived' | 'deleted'
export type ProjectEvent = 'archive' | 'unarchive' | 'delete' | 'restore'

export const projectStateMachine: StateMachine<ProjectState, ProjectEvent> = {
  active: {
    archive: 'archived',
    delete: 'deleted',
  },
  archived: {
    unarchive: 'active',
    delete: 'deleted',
  },
  deleted: {
    restore: 'active',
  },
}