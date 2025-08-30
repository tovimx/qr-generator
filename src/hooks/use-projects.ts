'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { ProjectWithStats } from '@/types/qr-code'
import { APIResponse, ProjectListResponse } from '@/types/api'

/**
 * Hook to fetch all projects for the current user
 */
export const useProjects = (initialData?: ProjectWithStats[]) => {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: async (): Promise<ProjectWithStats[]> => {
      const response = await fetch('/api/projects', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json() as ProjectListResponse
      return data.projects
    },
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes - projects don't change often
  })
}

/**
 * Hook to fetch a specific project by ID
 */
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: async (): Promise<ProjectWithStats> => {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }
      return response.json()
    },
    enabled: !!projectId,
  })
}

/**
 * Mutation to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string): Promise<ProjectWithStats> => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to create project')
      }

      return response.json()
    },
    onMutate: async (name: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.lists() })

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<ProjectWithStats[]>(
        queryKeys.projects.list()
      )

      // Optimistically update projects list
      if (previousProjects) {
        const optimisticProject: ProjectWithStats = {
          id: `temp-${Date.now()}`,
          name,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          clientId: '',
          _count: {
            qrCodes: 0,
          },
          qrCodeCount: 0,
          activeQRCount: 0,
          totalScans: 0,
          lastActivity: Date.now(),
        }

        queryClient.setQueryData<ProjectWithStats[]>(
          queryKeys.projects.list(),
          [...previousProjects, optimisticProject]
        )
      }

      return { previousProjects }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.list(), context.previousProjects)
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

/**
 * Mutation to update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }): Promise<ProjectWithStats> => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to update project')
      }

      return response.json()
    },
    onMutate: async ({ id, name }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData<ProjectWithStats>(
        queryKeys.projects.detail(id)
      )

      // Optimistically update
      if (previousProject) {
        const optimisticProject: ProjectWithStats = {
          ...previousProject,
          name,
          updatedAt: new Date(),
        }

        queryClient.setQueryData<ProjectWithStats>(
          queryKeys.projects.detail(id),
          optimisticProject
        )

        // Also update in projects list
        const previousProjects = queryClient.getQueryData<ProjectWithStats[]>(
          queryKeys.projects.list()
        )
        if (previousProjects) {
          queryClient.setQueryData<ProjectWithStats[]>(
            queryKeys.projects.list(),
            previousProjects.map(p => p.id === id ? optimisticProject : p)
          )
        }
      }

      return { previousProject }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), context.previousProject)
      }
    },
    onSettled: (data, error, { id }) => {
      // Refresh specific project and projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
  })
}

/**
 * Mutation to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json() as APIResponse
        throw new Error(error.error || 'Failed to delete project')
      }
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.lists() })

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<ProjectWithStats[]>(
        queryKeys.projects.list()
      )

      // Optimistically remove from projects list
      if (previousProjects) {
        queryClient.setQueryData<ProjectWithStats[]>(
          queryKeys.projects.list(),
          previousProjects.filter(p => p.id !== id)
        )
      }

      return { previousProjects }
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.list(), context.previousProjects)
      }
    },
    onSettled: (data, error, id) => {
      // Remove specific project data and refresh lists
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      // Also invalidate QR codes for this project
      queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes.list({ projectId: id }) })
    },
  })
}