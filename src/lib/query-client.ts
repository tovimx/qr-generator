'use client'

import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered stale after 1 minute
        staleTime: 1000 * 60,
        // Cache data for 5 minutes
        gcTime: 1000 * 60 * 5,
        // Retry failed requests 3 times
        retry: 3,
        // Exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for active data
        refetchOnWindowFocus: true,
        // Don't refetch on reconnect for cached data
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Show loading states immediately
        onMutate: () => {
          // Global loading state could be set here if needed
        },
      },
    },
  })
}

// Global query client instance for SSR compatibility
let clientSideQueryClient: QueryClient | undefined = undefined

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Client: make a new query client if we don't already have one
    if (!clientSideQueryClient) {
      clientSideQueryClient = createQueryClient()
    }
    return clientSideQueryClient
  }
}