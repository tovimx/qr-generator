/**
 * Migration Utilities for Branded Types
 * 
 * This module provides utilities to help migrate from regular string IDs
 * to branded types safely and gradually.
 */

import type {
  UserId, ClientId, ProjectId, QRCodeId, DomainId, LinkId,
  AnyUserId, AnyClientId, AnyProjectId, AnyQRCodeId, AnyDomainId, AnyLinkId
} from './branded-types'
import {
  createUserId, createClientId, createProjectId,
  createQRCodeId, createDomainId, createLinkId,
  extractId
} from './branded-types'

/**
 * Legacy type definitions that match the current unbranded types
 */
export type LegacyQRCodeData = {
  id: string
  userId: string
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
  clientId: string | null
  domainId: string | null
  projectId: string | null
  preferredDomainId: string | null
  links: Array<{
    id: string
    qrCodeId: string
    title: string
    url: string
    position: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }>
  _count: {
    scans: number
  }
  project?: {
    id: string
    clientId: string
    name: string
    isDefault: boolean
    createdAt: Date
    updatedAt: Date
  } | null
  preferredDomain?: {
    id: string
    hostname: string
    primary: boolean
    verified: boolean
  } | null
}

export type LegacyProjectWithStats = {
  id: string
  clientId: string
  name: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    qrCodes: number
  }
  qrCodeCount: number
  activeQRCount: number
  totalScans: number
  lastActivity: number
}

export type LegacyDomain = {
  id: string
  hostname: string
  primary: boolean
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Migration utilities to convert legacy types to branded types
 */
export const migrateLegacyQRCodeData = (legacy: LegacyQRCodeData) => ({
  ...legacy,
  id: createQRCodeId(legacy.id),
  userId: createUserId(legacy.userId),
  projectId: legacy.projectId ? createProjectId(legacy.projectId) : null,
  clientId: legacy.clientId ? createClientId(legacy.clientId) : null,
  domainId: legacy.domainId ? createDomainId(legacy.domainId) : null,
  preferredDomainId: legacy.preferredDomainId ? createDomainId(legacy.preferredDomainId) : null,
  links: legacy.links.map(link => ({
    ...link,
    id: createLinkId(link.id),
    qrCodeId: createQRCodeId(link.qrCodeId),
  })),
  project: legacy.project ? {
    ...legacy.project,
    id: createProjectId(legacy.project.id),
    clientId: createClientId(legacy.project.clientId),
  } : legacy.project,
  preferredDomain: legacy.preferredDomain ? {
    ...legacy.preferredDomain,
    id: createDomainId(legacy.preferredDomain.id),
  } : legacy.preferredDomain,
})

export const migrateLegacyProjectWithStats = (legacy: LegacyProjectWithStats) => ({
  ...legacy,
  id: createProjectId(legacy.id),
  clientId: createClientId(legacy.clientId),
})

export const migrateLegacyDomain = (legacy: LegacyDomain) => ({
  ...legacy,
  id: createDomainId(legacy.id),
})

/**
 * Reverse migration utilities to convert branded types back to strings
 * (useful for API calls that expect string IDs)
 */
// This function would be used for converting branded types back to legacy format
// For now, we'll mark it as deprecated since we're moving towards branded types
/** @deprecated Use branded types directly */
export const toBrandedToLegacyQRCodeData = (branded: Record<string, unknown>): LegacyQRCodeData => {
  // This is a temporary migration utility and will be removed once fully migrated
  return branded as unknown as LegacyQRCodeData
}

/**
 * Helper functions for API parameters
 */
export const apiParams = {
  qrCode: (id: AnyQRCodeId) => extractId(id),
  project: (id: AnyProjectId) => extractId(id),
  domain: (id: AnyDomainId) => extractId(id),
  user: (id: AnyUserId) => extractId(id),
  client: (id: AnyClientId) => extractId(id),
  link: (id: AnyLinkId) => extractId(id),
}

/**
 * Query key helpers that work with branded types
 */
export const brandedQueryKeys = {
  qrCodes: {
    all: ['qr-codes'] as const,
    lists: () => ['qr-codes', 'list'] as const,
    list: (filters?: { projectId?: AnyProjectId; userId?: AnyUserId }) => {
      const apiFilters = filters ? {
        ...(filters.projectId && { projectId: extractId(filters.projectId) }),
        ...(filters.userId && { userId: extractId(filters.userId) }),
      } : undefined
      return ['qr-codes', 'list', apiFilters] as const
    },
    details: () => ['qr-codes', 'detail'] as const,
    detail: (id: AnyQRCodeId) => ['qr-codes', 'detail', extractId(id)] as const,
  },

  projects: {
    all: ['projects'] as const,
    lists: () => ['projects', 'list'] as const,
    list: (userId?: AnyUserId) => {
      const apiUserId = userId ? extractId(userId) : undefined
      return ['projects', 'list', { userId: apiUserId }] as const
    },
    details: () => ['projects', 'detail'] as const,
    detail: (id: AnyProjectId) => ['projects', 'detail', extractId(id)] as const,
  },

  domains: {
    all: ['domains'] as const,
    lists: () => ['domains', 'list'] as const,
    list: (filters?: { clientId?: AnyClientId }) => {
      const apiFilters = filters ? {
        ...(filters.clientId && { clientId: extractId(filters.clientId) }),
      } : undefined
      return ['domains', 'list', apiFilters] as const
    },
    details: () => ['domains', 'detail'] as const,
    detail: (id: AnyDomainId) => ['domains', 'detail', extractId(id)] as const,
  },
}

/**
 * Type assertion helpers for gradual migration
 */
export const assertBrandedId = {
  qrCode: (id: string): QRCodeId => createQRCodeId(id),
  project: (id: string): ProjectId => createProjectId(id),
  domain: (id: string): DomainId => createDomainId(id),
  user: (id: string): UserId => createUserId(id),
  client: (id: string): ClientId => createClientId(id),
  link: (id: string): LinkId => createLinkId(id),
}

/**
 * Validation helpers that ensure IDs are valid before creating branded types
 */
export const safeBrandedId = {
  qrCode: (id: unknown): QRCodeId => {
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error(`Invalid QR Code ID: ${id}`)
    }
    return createQRCodeId(id)
  },
  
  project: (id: unknown): ProjectId => {
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error(`Invalid Project ID: ${id}`)
    }
    return createProjectId(id)
  },
  
  domain: (id: unknown): DomainId => {
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error(`Invalid Domain ID: ${id}`)
    }
    return createDomainId(id)
  },
  
  user: (id: unknown): UserId => {
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error(`Invalid User ID: ${id}`)
    }
    return createUserId(id)
  },
}