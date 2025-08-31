'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { QRCodeData } from '@/types/qr-code'
import { APIResponse, QRCodeListResponse, QRCodeCreateResponse } from '@/types/api'

/**
 * Hook to fetch QR codes for a specific project
 */
export const useQRCodes = (projectId?: string, initialData?: QRCodeData[]) => {
  return useQuery({
    queryKey: queryKeys.qrCodes.list({ projectId }),
    queryFn: async (): Promise<QRCodeData[]> => {
      const url = projectId ? `/api/qr-codes?projectId=${projectId}` : '/api/qr-codes'
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch QR codes')
      }
      const data = await response.json() as QRCodeListResponse
      return data.qrCodes
    },
    initialData,
    enabled: !!projectId, // Only run query if projectId is provided
    staleTime: 1000 * 60, // 1 minute - QR codes change more frequently
  })
}

/**
 * Hook to fetch a specific QR code by ID
 */
export const useQRCode = (qrCodeId: string) => {
  return useQuery({
    queryKey: queryKeys.qrCodes.detail(qrCodeId),
    queryFn: async (): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${qrCodeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch QR code')
      }
      return response.json()
    },
    enabled: !!qrCodeId,
  })
}

/**
 * Mutation to create a new QR code
 */
export const useCreateQRCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ title, projectId }: { title: string; projectId: string }): Promise<QRCodeData> => {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, projectId }),
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to create QR code')
      }

      return response.json() as Promise<QRCodeCreateResponse>
    },
    onMutate: async ({ title, projectId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.qrCodes.list({ projectId }) 
      })

      // Snapshot the previous value
      const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
        queryKeys.qrCodes.list({ projectId })
      )

      // Optimistically update QR codes list
      if (previousQRCodes) {
        const optimisticQRCode: QRCodeData = {
          id: `temp-${Date.now()}`,
          title,
          shortCode: `temp${Date.now()}`,
          projectId,
          userId: '', // Will be set by server
          redirectType: 'links' as const,
          redirectUrl: null,
          isActive: true,
          position: 0,
          deletedAt: null,
          clientId: null,
          domainId: null,
          fgColor: '#000000',
          logoUrl: null,
          logoSize: 20,
          logoShape: 'square' as const,
          cornerRadius: 0,
          // Design fields with defaults
          themeId: 'default',
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          backgroundType: 'gradient',
          backgroundValue: null,
          buttonStyle: 'rounded',
          cardStyle: 'floating',
          fontFamily: 'inter',
          customCss: null,
          avatarUrl: null,
          avatarStyle: 'circle',
          description: null,
          socialLinks: null,
          customTitle: null,
          showTitle: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          links: [],
          _count: {
            scans: 0,
          },
          preferredDomainId: null,
          preferredDomain: null,
          project: {
            id: projectId,
            name: 'Loading...',
            isDefault: false,
            clientId: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }

        queryClient.setQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId }),
          [...previousQRCodes, optimisticQRCode]
        )
      }

      return { previousQRCodes }
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousQRCodes) {
        queryClient.setQueryData(
          queryKeys.qrCodes.list({ projectId }),
          context.previousQRCodes
        )
      }
    },
    onSettled: (data, error, { projectId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.qrCodes.list({ projectId }) 
      })
      // Also refresh projects to update QR count
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
  })
}

/**
 * Mutation to update QR code properties
 */
export const useUpdateQRCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<QRCodeData, 'title' | 'redirectType' | 'redirectUrl' | 'fgColor' | 'logoUrl' | 'logoSize' | 'logoShape' | 'cornerRadius'>>
    }): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to update QR code')
      }

      return response.json()
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.qrCodes.detail(id) })

      // Snapshot the previous value
      const previousQRCode = queryClient.getQueryData<QRCodeData>(
        queryKeys.qrCodes.detail(id)
      )

      // Optimistically update
      if (previousQRCode) {
        const optimisticQRCode: QRCodeData = {
          ...previousQRCode,
          ...updates,
          updatedAt: new Date(),
        }

        queryClient.setQueryData<QRCodeData>(
          queryKeys.qrCodes.detail(id),
          optimisticQRCode
        )

        // Also update in QR codes list if it exists
        const projectId = previousQRCode.projectId
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: projectId || undefined })
        )
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: projectId || undefined }),
            previousQRCodes.map(qr => qr.id === id ? optimisticQRCode : qr)
          )
        }
      }

      return { previousQRCode }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousQRCode) {
        queryClient.setQueryData(queryKeys.qrCodes.detail(id), context.previousQRCode)
      }
    },
    onSettled: (data, error, { id }) => {
      // Refresh specific QR code
      queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes.detail(id) })
      
      // Refresh QR codes list if we have the projectId
      if (data?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.qrCodes.list({ projectId: data.projectId }) 
        })
      }
    },
  })
}

/**
 * Mutation to update QR code destination
 */
export const useUpdateQRCodeDestination = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      redirectType, 
      redirectUrl 
    }: { 
      id: string; 
      redirectType: 'links' | 'url'; 
      redirectUrl?: string | null 
    }): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${id}/destination`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectType, redirectUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to update destination')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.qrCodes.detail(data.id), data)
      
      // Update in list cache too
      if (data.projectId) {
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: data.projectId })
        )
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: data.projectId }),
            previousQRCodes.map(qr => qr.id === data.id ? data : qr)
          )
        }
      }
    },
  })
}

/**
 * Mutation to update QR code style
 */
export const useUpdateQRCodeStyle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      fgColor, 
      cornerRadius 
    }: { 
      id: string; 
      fgColor?: string; 
      cornerRadius?: number 
    }): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${id}/style`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(fgColor !== undefined && { fgColor }),
          ...(cornerRadius !== undefined && { cornerRadius }),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update style')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.qrCodes.detail(data.id), data)
      
      // Update in list cache too
      if (data.projectId) {
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: data.projectId })
        )
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: data.projectId }),
            previousQRCodes.map(qr => qr.id === data.id ? data : qr)
          )
        }
      }
    },
  })
}

/**
 * Mutation to update QR code logo
 */
export const useUpdateQRCodeLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      logoUrl, 
      logoSize, 
      logoShape 
    }: { 
      id: string; 
      logoUrl: string | null; 
      logoSize: number; 
      logoShape: 'square' | 'circle' 
    }): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${id}/logo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl, logoSize, logoShape }),
      })

      if (!response.ok) {
        throw new Error('Failed to update logo')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.qrCodes.detail(data.id), data)
      
      // Update in list cache too
      if (data.projectId) {
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: data.projectId })
        )
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: data.projectId }),
            previousQRCodes.map(qr => qr.id === data.id ? data : qr)
          )
        }
      }
    },
  })
}

/**
 * Mutation to update QR code links
 */
export const useUpdateQRCodeLinks = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      links 
    }: { 
      id: string; 
      links: Array<{
        title: string;
        url: string;
        position: number;
      }>
    }): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${id}/links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      })

      if (!response.ok) {
        throw new Error('Failed to update links')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.qrCodes.detail(data.id), data)
      
      // Update in list cache too
      if (data.projectId) {
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: data.projectId })
        )
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: data.projectId }),
            previousQRCodes.map(qr => qr.id === data.id ? data : qr)
          )
        }
      }
    },
  })
}

/**
 * Mutation to delete a QR code
 */
export const useDeleteQRCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to delete QR code')
      }
    },
    onMutate: async (id: string) => {
      // Get the QR code to find its projectId
      const qrCode = queryClient.getQueryData<QRCodeData>(
        queryKeys.qrCodes.detail(id)
      )

      if (qrCode?.projectId) {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.qrCodes.list({ projectId: qrCode.projectId }) 
        })

        // Snapshot the previous value
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: qrCode.projectId })
        )

        // Optimistically remove from QR codes list
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: qrCode.projectId }),
            previousQRCodes.filter(qr => qr.id !== id)
          )
        }

        return { previousQRCodes, projectId: qrCode.projectId }
      }

      return {}
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousQRCodes && context.projectId) {
        queryClient.setQueryData(
          queryKeys.qrCodes.list({ projectId: context.projectId }),
          context.previousQRCodes
        )
      }
    },
    onSettled: (data, error, id, context) => {
      // Remove specific QR code data
      queryClient.removeQueries({ queryKey: queryKeys.qrCodes.detail(id) })
      
      // Refresh QR codes list and projects (to update counts)
      if (context?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.qrCodes.list({ projectId: context.projectId }) 
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
  })
}

/**
 * Mutation to update QR code preferred domain
 */
export const useUpdateQRCodePreferredDomain = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      preferredDomainId 
    }: { 
      id: string; 
      preferredDomainId: string | null 
    }): Promise<QRCodeData> => {
      const response = await fetch(`/api/qr-codes/${id}/preferred-domain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredDomainId }),
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to update preferred domain')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.qrCodes.detail(data.id), data)
      
      // Update in list cache too
      if (data.projectId) {
        const previousQRCodes = queryClient.getQueryData<QRCodeData[]>(
          queryKeys.qrCodes.list({ projectId: data.projectId || undefined })
        )
        if (previousQRCodes) {
          queryClient.setQueryData<QRCodeData[]>(
            queryKeys.qrCodes.list({ projectId: data.projectId || undefined }),
            previousQRCodes.map(qr => qr.id === data.id ? data : qr)
          )
        }
      }
    },
  })
}