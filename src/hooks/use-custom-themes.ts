import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { APIResponse } from '@/types/api'
import { DesignSettings } from '@/types/design'
import { ThemeTemplate } from '@/lib/themes/templates'

export interface CreateCustomThemeRequest {
  name: string
  design: DesignSettings
}

export function useCustomThemes() {
  return useQuery({
    queryKey: ['custom-themes'],
    queryFn: async (): Promise<ThemeTemplate[]> => {
      const response = await fetch('/api/custom-themes')
      
      if (!response.ok) {
        const errorData = (await response.json()) as APIResponse
        throw new Error(errorData.error || 'Failed to fetch custom themes')
      }

      const result = (await response.json()) as APIResponse<ThemeTemplate[]>
      return result.data || []
    },
  })
}

export function useCreateCustomTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCustomThemeRequest): Promise<ThemeTemplate> => {
      const response = await fetch('/api/custom-themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as APIResponse
        throw new Error(errorData.error || 'Failed to create custom theme')
      }

      const result = (await response.json()) as APIResponse<ThemeTemplate>
      if (!result.data) {
        throw new Error('No data returned from server')
      }

      return result.data
    },
    onSuccess: () => {
      // Invalidate custom themes cache
      queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
  })
}

export function useDeleteCustomTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (themeId: string): Promise<void> => {
      const response = await fetch(`/api/custom-themes/${themeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = (await response.json()) as APIResponse
        throw new Error(errorData.error || 'Failed to delete custom theme')
      }
    },
    onSuccess: () => {
      // Invalidate custom themes cache
      queryClient.invalidateQueries({ queryKey: ['custom-themes'] })
    },
  })
}