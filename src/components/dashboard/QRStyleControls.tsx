'use client'

import { useState, useEffect } from 'react'
import { getSafeLimits } from '@/lib/utils/qr-validation'

interface QRStyleControlsProps {
  cornerRadius: number
  onStyleUpdate: (cornerRadius: number) => Promise<void>
}

export default function QRStyleControls({ 
  cornerRadius: initialRadius,
  onStyleUpdate 
}: QRStyleControlsProps) {
  const [cornerRadius, setCornerRadius] = useState(initialRadius)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update local state when props change (switching tabs)
  useEffect(() => {
    setCornerRadius(initialRadius)
  }, [initialRadius])

  const handleRadiusChange = async (newRadius: number) => {
    setCornerRadius(newRadius)
    setLoading(true)
    setError(null)

    try {
      await onStyleUpdate(newRadius)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update style')
      // Revert to previous value on error
      setCornerRadius(initialRadius)
    } finally {
      setLoading(false)
    }
  }

  const limits = getSafeLimits()
  const presets = [
    { value: 0, label: 'Square', icon: '⬜' },
    { value: 2, label: 'Slightly Rounded', icon: '🔲' },
    { value: 5, label: 'Rounded', icon: '⭕' },
    { value: 10, label: 'Very Rounded', icon: '🔵', warning: true }
  ]

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-2">QR Code Style</p>
        
        {/* Preset buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleRadiusChange(preset.value)}
              className={`p-2 text-xs rounded-md transition-colors cursor-pointer ${
                cornerRadius === preset.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={loading}
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div>{preset.label}</div>
              {preset.warning && preset.value > limits.cornerRadius.maximum && (
                <div className="text-xs text-orange-600 mt-1">⚠️ Risky</div>
              )}
            </button>
          ))}
        </div>

        {/* Custom slider */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Corner Roundness: {cornerRadius === 0 ? 'Square' : `${cornerRadius * 10}% rounded`}
            {cornerRadius > limits.cornerRadius.maximum && (
              <span className="text-orange-600 ml-2">⚠️ May affect scanning</span>
            )}
            {cornerRadius >= limits.cornerRadius.critical && (
              <span className="text-red-600 ml-2">🚫 Too rounded for scanning</span>
            )}
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={cornerRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full"
              disabled={loading}
            />
            {/* Safe zone indicator */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex">
              <div 
                className="bg-green-200 opacity-20 h-full" 
                style={{ width: `${limits.cornerRadius.optimal * 10}%` }}
              />
              <div 
                className="bg-yellow-200 opacity-20 h-full" 
                style={{ width: `${(limits.cornerRadius.maximum - limits.cornerRadius.optimal) * 10}%` }}
              />
              <div 
                className="bg-red-200 opacity-20 h-full flex-1"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Square</span>
            <span className="text-green-600">Safe</span>
            <span className="text-yellow-600">Caution</span>
            <span>Very Rounded</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}