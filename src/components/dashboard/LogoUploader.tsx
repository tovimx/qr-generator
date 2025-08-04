'use client'

import { useState, useRef } from 'react'
import { getSafeLimits } from '@/lib/utils/qr-validation'

interface LogoUploaderProps {
  qrCodeId: string
  userId: string
  currentLogoUrl: string | null
  logoSize: number
  onLogoUpdate: (logoUrl: string | null, logoSize: number) => void
}

export default function LogoUploader({ 
  qrCodeId, 
  userId, 
  currentLogoUrl, 
  logoSize: initialLogoSize,
  onLogoUpdate 
}: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [logoSize, setLogoSize] = useState(initialLogoSize)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // Upload via API endpoint (server-side handles auth better)
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`/api/qr-codes/${qrCodeId}/logo/upload`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const { logoUrl } = await response.json()
      
      if (logoUrl) {
        await onLogoUpdate(logoUrl, logoSize)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return

    setUploading(true)
    setError(null)

    try {
      // Simply update to null - the API will handle cleanup
      await onLogoUpdate(null, logoSize)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSizeChange = async (newSize: number) => {
    setLogoSize(newSize)
    await onLogoUpdate(currentLogoUrl, newSize)
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">QR Code Logo</p>
        {currentLogoUrl && (
          <button
            onClick={handleRemoveLogo}
            disabled={uploading}
            className="text-sm text-red-600 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        {currentLogoUrl ? (
          <div className="flex items-center space-x-4">
            <img 
              src={currentLogoUrl} 
              alt="QR Logo" 
              className="w-16 h-16 object-contain border border-gray-300 rounded"
            />
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                Logo Size: {logoSize}%
                {logoSize > getSafeLimits().logoSize.maximum && (
                  <span className="text-orange-600 ml-2">⚠️ Large logo may affect scanning</span>
                )}
                {logoSize >= getSafeLimits().logoSize.critical && (
                  <span className="text-red-600 ml-2">🚫 Too large for reliable scanning</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={logoSize}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="w-full"
                  disabled={uploading}
                />
                {/* Safe zone indicator */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex">
                  <div 
                    className="bg-green-200 opacity-20 h-full" 
                    style={{ width: `${(getSafeLimits().logoSize.optimal - 10) * 3.33}%` }}
                  />
                  <div 
                    className="bg-yellow-200 opacity-20 h-full" 
                    style={{ width: `${(getSafeLimits().logoSize.maximum - getSafeLimits().logoSize.optimal) * 3.33}%` }}
                  />
                  <div 
                    className="bg-red-200 opacity-20 h-full flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span className="text-green-600">Safe</span>
                <span className="text-yellow-600">Caution</span>
                <span>40%</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Click to upload logo (PNG, JPG, SVG)'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Max size: 2MB. Logo will appear in center of QR code.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}