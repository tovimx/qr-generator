/**
 * Query Keys Factory Pattern for TanStack Query
 * 
 * This factory provides a hierarchical structure for query keys that enables:
 * - Granular cache invalidation
 * - Type-safe key generation
 * - Consistent key naming across the application
 * 
 * Key Structure:
 * - projects: ['projects']
 * - projects for user: ['projects', userId]
 * - qr-codes: ['qr-codes']
 * - qr-codes for project: ['qr-codes', { projectId }]
 * - single qr-code: ['qr-codes', qrCodeId]
 * - domains: ['domains']
 * - domains for client: ['domains', { clientId }]
 */

export const queryKeys = {
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (userId?: string) => [...queryKeys.projects.lists(), { userId }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },

  // QR Codes
  qrCodes: {
    all: ['qr-codes'] as const,
    lists: () => [...queryKeys.qrCodes.all, 'list'] as const,
    list: (filters?: { projectId?: string; userId?: string }) => 
      [...queryKeys.qrCodes.lists(), filters] as const,
    details: () => [...queryKeys.qrCodes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.qrCodes.details(), id] as const,
  },

  // Domains
  domains: {
    all: ['domains'] as const,
    lists: () => [...queryKeys.domains.all, 'list'] as const,
    list: (filters?: { clientId?: string }) => 
      [...queryKeys.domains.lists(), filters] as const,
    details: () => [...queryKeys.domains.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.domains.details(), id] as const,
  },

  // Links (for QR codes)
  links: {
    all: ['links'] as const,
    lists: () => [...queryKeys.links.all, 'list'] as const,
    list: (qrCodeId: string) => [...queryKeys.links.lists(), { qrCodeId }] as const,
  },

  // Analytics (for future use)
  analytics: {
    all: ['analytics'] as const,
    scans: () => [...queryKeys.analytics.all, 'scans'] as const,
    scansByQrCode: (qrCodeId: string) => [...queryKeys.analytics.scans(), { qrCodeId }] as const,
  },
} as const

/**
 * Helper function to invalidate related queries
 * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
 */
export const invalidationPatterns = {
  // Invalidate all project-related data
  projects: () => queryKeys.projects.all,
  
  // Invalidate specific project and its QR codes
  projectWithQrCodes: (projectId: string) => [
    queryKeys.projects.detail(projectId),
    queryKeys.qrCodes.list({ projectId }),
  ],
  
  // Invalidate all QR codes for a project
  qrCodesForProject: (projectId: string) => queryKeys.qrCodes.list({ projectId }),
  
  // Invalidate specific QR code and its links
  qrCodeWithLinks: (qrCodeId: string) => [
    queryKeys.qrCodes.detail(qrCodeId),
    queryKeys.links.list(qrCodeId),
  ],
  
  // Invalidate all domain-related data
  domains: () => queryKeys.domains.all,
} as const