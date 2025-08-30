/**
 * Branded Types for ID Safety
 * 
 * This module implements branded/nominal types to provide compile-time safety
 * for different types of IDs, preventing accidental mixing of IDs.
 * 
 * Examples:
 * - Cannot pass a QRCodeId where a ProjectId is expected
 * - Cannot accidentally use a temporary ID as a real ID
 * - Provides clear documentation of what type of ID is expected
 */

// Brand symbol to make types nominal instead of structural
declare const __brand: unique symbol

/**
 * Base branded type utility
 */
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand }

/**
 * Branded ID types for compile-time safety
 */
export type UserId = Brand<string, 'UserId'>
export type ClientId = Brand<string, 'ClientId'>
export type ProjectId = Brand<string, 'ProjectId'>
export type QRCodeId = Brand<string, 'QRCodeId'>
export type DomainId = Brand<string, 'DomainId'>
export type LinkId = Brand<string, 'LinkId'>

/**
 * Temporary ID types for optimistic updates
 */
export type TempId = Brand<string, 'TempId'>
export type TempUserId = Brand<string, 'TempUserId'>
export type TempClientId = Brand<string, 'TempClientId'>
export type TempProjectId = Brand<string, 'TempProjectId'>
export type TempQRCodeId = Brand<string, 'TempQRCodeId'>
export type TempDomainId = Brand<string, 'TempDomainId'>
export type TempLinkId = Brand<string, 'TempLinkId'>

/**
 * Factory functions to create branded IDs safely
 */
export const createUserId = (id: string): UserId => id as UserId
export const createClientId = (id: string): ClientId => id as ClientId  
export const createProjectId = (id: string): ProjectId => id as ProjectId
export const createQRCodeId = (id: string): QRCodeId => id as QRCodeId
export const createDomainId = (id: string): DomainId => id as DomainId
export const createLinkId = (id: string): LinkId => id as LinkId

/**
 * Temporary ID factory functions
 */
export const createTempUserId = (id: string): TempUserId => id as TempUserId
export const createTempClientId = (id: string): TempClientId => id as TempClientId
export const createTempProjectId = (id: string): TempProjectId => id as TempProjectId
export const createTempQRCodeId = (id: string): TempQRCodeId => id as TempQRCodeId
export const createTempDomainId = (id: string): TempDomainId => id as TempDomainId
export const createTempLinkId = (id: string): TempLinkId => id as TempLinkId

/**
 * Type guards to check if an ID is temporary (starts with 'temp-')
 */
export const isTempId = (id: string): id is TempId => id.startsWith('temp-')
export const isTempUserId = (id: UserId | TempUserId): id is TempUserId => isTempId(id)
export const isTempClientId = (id: ClientId | TempClientId): id is TempClientId => isTempId(id)
export const isTempProjectId = (id: ProjectId | TempProjectId): id is TempProjectId => isTempId(id)
export const isTempQRCodeId = (id: QRCodeId | TempQRCodeId): id is TempQRCodeId => isTempId(id)
export const isTempDomainId = (id: DomainId | TempDomainId): id is TempDomainId => isTempId(id)
export const isTempLinkId = (id: LinkId | TempLinkId): id is TempLinkId => isTempId(id)

/**
 * Utility to extract the raw string value from branded types
 */
export const extractId = <T extends Brand<string, string>>(id: T): string => id as string

/**
 * Union types for flexibility when dealing with both real and temporary IDs
 */
export type AnyUserId = UserId | TempUserId
export type AnyClientId = ClientId | TempClientId  
export type AnyProjectId = ProjectId | TempProjectId
export type AnyQRCodeId = QRCodeId | TempQRCodeId
export type AnyDomainId = DomainId | TempDomainId
export type AnyLinkId = LinkId | TempLinkId

/**
 * ID validation utilities with branded types
 */
export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0
}

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Safe ID validation with branded return types
 */
export const validateUserId = (id: string): UserId => {
  if (!isValidId(id)) {
    throw new Error(`Invalid user ID: ${id}`)
  }
  return createUserId(id)
}

export const validateProjectId = (id: string): ProjectId => {
  if (!isValidId(id)) {
    throw new Error(`Invalid project ID: ${id}`)
  }
  return createProjectId(id)
}

export const validateQRCodeId = (id: string): QRCodeId => {
  if (!isValidId(id)) {
    throw new Error(`Invalid QR code ID: ${id}`)
  }
  return createQRCodeId(id)
}

export const validateDomainId = (id: string): DomainId => {
  if (!isValidId(id)) {
    throw new Error(`Invalid domain ID: ${id}`)
  }
  return createDomainId(id)
}

/**
 * Branded types for the schemas - update schema types to use branded IDs
 */
export type BrandedUser = {
  id: UserId
  email: string
  createdAt: Date
  updatedAt: Date
}

export type BrandedProject = {
  id: ProjectId
  clientId: ClientId
  name: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export type BrandedQRCode = {
  id: QRCodeId
  userId: UserId
  projectId: ProjectId | null
  shortCode: string
  title: string
  isActive: boolean
  position: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  redirectType: 'links' | 'url'
  redirectUrl: string | null
  logoSize: number
  logoUrl: string | null
  logoShape: 'square' | 'circle'
  cornerRadius: number
  fgColor: string
  clientId: ClientId | null
  domainId: DomainId | null
  preferredDomainId: DomainId | null
}

export type BrandedDomain = {
  id: DomainId
  hostname: string
  primary: boolean
  verified: boolean
  type: string
  clientId: ClientId
  createdAt: Date
  updatedAt: Date
}

export type BrandedLink = {
  id: LinkId
  qrCodeId: QRCodeId
  title: string
  url: string
  position: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}