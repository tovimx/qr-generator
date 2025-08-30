'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { APIResponse, DomainListResponse } from '@/types/api'

export interface Domain {
  id: string
  hostname: string
  primary: boolean
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Hook to fetch all domains for the current user/client
 */
export const useDomains = (initialData?: Domain[]) => {
  return useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: async (): Promise<Domain[]> => {
      const response = await fetch('/api/domains', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch domains')
      }
      const data = await response.json() as DomainListResponse
      return (data.domains || []) as Domain[]
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes - domains don't change often
  })
}

/**
 * Hook to fetch a specific domain by ID
 */
export const useDomain = (domainId: string) => {
  return useQuery({
    queryKey: queryKeys.domains.detail(domainId),
    queryFn: async (): Promise<Domain> => {
      const response = await fetch(`/api/domains/${domainId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch domain')
      }
      return response.json()
    },
    enabled: !!domainId,
  })
}

/**
 * Mutation to create a new domain
 */
export const useCreateDomain = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (hostname: string): Promise<Domain> => {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname }),
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to create domain')
      }

      return response.json()
    },
    onMutate: async (hostname: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.domains.lists() })

      // Snapshot the previous value
      const previousDomains = queryClient.getQueryData<Domain[]>(
        queryKeys.domains.list()
      )

      // Optimistically update domains list
      if (previousDomains) {
        const optimisticDomain: Domain = {
          id: `temp-${Date.now()}`,
          hostname,
          primary: false,
          verified: false, // New domains start unverified
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        queryClient.setQueryData<Domain[]>(
          queryKeys.domains.list(),
          [...previousDomains, optimisticDomain]
        )
      }

      return { previousDomains }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDomains) {
        queryClient.setQueryData(queryKeys.domains.list(), context.previousDomains)
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.domains.all })
    },
  })
}

/**
 * Mutation to set a domain as primary
 */
export const useSetPrimaryDomain = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (domainId: string): Promise<Domain> => {
      const response = await fetch(`/api/domains/${domainId}/primary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to set primary domain')
      }

      return response.json()
    },
    onMutate: async (domainId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.domains.lists() })

      // Snapshot the previous value
      const previousDomains = queryClient.getQueryData<Domain[]>(
        queryKeys.domains.list()
      )

      // Optimistically update - set all domains to non-primary except the selected one
      if (previousDomains) {
        const updatedDomains = previousDomains.map(domain => ({
          ...domain,
          primary: domain.id === domainId,
          updatedAt: new Date(),
        }))

        queryClient.setQueryData<Domain[]>(
          queryKeys.domains.list(),
          updatedDomains
        )
      }

      return { previousDomains }
    },
    onError: (error, domainId, context) => {
      // Rollback on error
      if (context?.previousDomains) {
        queryClient.setQueryData(queryKeys.domains.list(), context.previousDomains)
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.domains.all })
    },
  })
}

/**
 * Mutation to update domain verification status
 */
export const useVerifyDomain = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (domainId: string): Promise<Domain> => {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to verify domain')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(queryKeys.domains.detail(data.id), data)
      
      // Update in list cache too
      const previousDomains = queryClient.getQueryData<Domain[]>(
        queryKeys.domains.list()
      )
      if (previousDomains) {
        queryClient.setQueryData<Domain[]>(
          queryKeys.domains.list(),
          previousDomains.map(domain => domain.id === data.id ? data : domain)
        )
      }
    },
  })
}

/**
 * Mutation to delete a domain
 */
export const useDeleteDomain = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to delete domain')
      }
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.domains.lists() })

      // Snapshot the previous value
      const previousDomains = queryClient.getQueryData<Domain[]>(
        queryKeys.domains.list()
      )

      // Optimistically remove from domains list
      if (previousDomains) {
        queryClient.setQueryData<Domain[]>(
          queryKeys.domains.list(),
          previousDomains.filter(domain => domain.id !== id)
        )
      }

      return { previousDomains }
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousDomains) {
        queryClient.setQueryData(queryKeys.domains.list(), context.previousDomains)
      }
    },
    onSettled: (data, error, id) => {
      // Remove specific domain data and refresh lists
      queryClient.removeQueries({ queryKey: queryKeys.domains.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.domains.lists() })
    },
  })
}