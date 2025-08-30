'use client'

import { useState } from 'react'
import { User } from '@prisma/client'
import { Plus, X, Edit2, Check, AlertCircle } from 'lucide-react'
import { QRCodeData } from '@/types/qr-code'
import { useCreateQRCode, useDeleteQRCode, useUpdateQRCode } from '@/hooks/use-qr-codes'

interface QRCodeTabsProps {
  user: User
  qrCodes: QRCodeData[]
  onQRCodeSelect: (qrCode: QRCodeData) => void
  selectedQRCode: QRCodeData | null
  projectId?: string // Optional for backward compatibility
}

export default function QRCodeTabs({ qrCodes, onQRCodeSelect, selectedQRCode, projectId }: QRCodeTabsProps) {
  // TanStack Query mutations
  const createQRCodeMutation = useCreateQRCode()
  const deleteQRCodeMutation = useDeleteQRCode()
  const updateQRCodeMutation = useUpdateQRCode()

  // Local state
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  
  const loading = createQRCodeMutation.isPending || deleteQRCodeMutation.isPending || updateQRCodeMutation.isPending
  const error: string | null = null // Error handling is done by mutation hooks

  const handleCreateQRCode = async () => {
    // If no projectId provided, we can't create a QR code in the new architecture
    if (!projectId) {
      console.error('Cannot create QR code without projectId')
      return
    }

    try {
      const newQrCode = await createQRCodeMutation.mutateAsync({
        title: `QR Code ${qrCodes.length + 1}`,
        projectId
      })
      
      // Auto-select the new QR code immediately
      onQRCodeSelect(newQrCode)
    } catch (err) {
      console.error('Failed to create QR code:', err)
      // Error handling is done by the mutation hook
    }
  }

  const handleDeleteQRCode = async (qrCodeId: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return
    }

    try {
      await deleteQRCodeMutation.mutateAsync(qrCodeId)
      
      // If we deleted the selected QR code, select the first remaining one
      if (selectedQRCode?.id === qrCodeId && qrCodes.length > 1) {
        const remaining = qrCodes.filter(qr => qr.id !== qrCodeId)
        if (remaining.length > 0) {
          onQRCodeSelect(remaining[0])
        }
      }
    } catch (err) {
      console.error('Failed to delete QR code:', err)
      // Error handling is done by the mutation hook
    }
  }

  const handleTitleEdit = async (qrCodeId: string) => {
    if (!newTitle.trim()) {
      setEditingTitle(null)
      return
    }

    try {
      await updateQRCodeMutation.mutateAsync({
        id: qrCodeId,
        updates: { title: newTitle.trim() }
      })

      setEditingTitle(null)
      setNewTitle('')
    } catch (err) {
      console.error('Failed to update title:', err)
      // Error handling is done by the mutation hook
    }
  }

  const startEditingTitle = (qrCode: QRCodeData) => {
    setEditingTitle(qrCode.id)
    setNewTitle(qrCode.title)
  }

  const cancelEditingTitle = () => {
    setEditingTitle(null)
    setNewTitle('')
  }

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven&apos;t created any QR codes yet.</p>
        <button
          onClick={handleCreateQRCode}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Creating...' : 'Create Your First QR Code'}
        </button>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-1 overflow-x-auto">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="flex items-center group">
              <button
                onClick={() => onQRCodeSelect(qrCode)}
                className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap cursor-pointer ${
                  selectedQRCode?.id === qrCode.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {editingTitle === qrCode.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleEdit(qrCode.id)
                        if (e.key === 'Escape') cancelEditingTitle()
                      }}
                    />
                    <button
                      onClick={() => handleTitleEdit(qrCode.id)}
                      disabled={loading}
                      className="p-1 text-green-600 hover:text-green-700 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditingTitle}
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate max-w-[120px]">{qrCode.title}</span>
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {qrCode._count.scans}
                    </span>
                  </>
                )}
              </button>
              
              {editingTitle !== qrCode.id && (
                <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditingTitle(qrCode)}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Edit title"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {qrCodes.length > 1 && (
                    <button
                      onClick={() => handleDeleteQRCode(qrCode.id)}
                      disabled={loading}
                      className="p-1 text-red-400 hover:text-red-600 ml-1 cursor-pointer disabled:cursor-not-allowed"
                      title="Delete QR code"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Add new QR code button */}
          {qrCodes.length < 10 && (
            <button
              onClick={handleCreateQRCode}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 cursor-pointer disabled:cursor-not-allowed"
              title="Create new QR code"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </nav>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* QR Code limit notice */}
      {qrCodes.length >= 10 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            You&apos;ve reached the maximum of 10 QR codes per account.
          </p>
        </div>
      )}
    </div>
  )
}