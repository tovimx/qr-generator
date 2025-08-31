import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DesignSettings } from '@/types/design'
import { showSuccess, showError } from '@/lib/toast'

// Get design settings for a QR code
export function useDesignSettings(qrCodeId: string) {
  return useQuery({
    queryKey: ['design-settings', qrCodeId],
    queryFn: async (): Promise<DesignSettings> => {
      const response = await fetch(`/api/qr-codes/${qrCodeId}/design`)
      if (!response.ok) {
        throw new Error('Failed to fetch design settings')
      }
      return response.json()
    },
    enabled: !!qrCodeId,
  })
}

// Update design settings
export function useUpdateDesign(qrCodeId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Partial<DesignSettings>) => {
      const response = await fetch(`/api/qr-codes/${qrCodeId}/design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update design')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['design-settings', qrCodeId] })
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] })
      showSuccess('Design updated successfully!')
    },
    onError: (error: Error) => {
      showError(error.message)
    },
  })
}