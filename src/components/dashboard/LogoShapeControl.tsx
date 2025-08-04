'use client'

import { useState } from 'react'

interface LogoShapeControlProps {
  logoShape: string
  onShapeUpdate: (logoShape: string) => Promise<void>
}

export default function LogoShapeControl({ 
  logoShape: initialShape,
  onShapeUpdate 
}: LogoShapeControlProps) {
  const [logoShape, setLogoShape] = useState(initialShape)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShapeChange = async (newShape: string) => {
    if (newShape === logoShape) return
    
    setLogoShape(newShape)
    setLoading(true)
    setError(null)

    try {
      await onShapeUpdate(newShape)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update logo shape')
      // Revert on error
      setLogoShape(initialShape)
    } finally {
      setLoading(false)
    }
  }

  const shapes = [
    { 
      value: 'square', 
      label: 'Square', 
      icon: '⬜',
      description: 'Standard square logo area'
    },
    { 
      value: 'circle', 
      label: 'Circle (Coming Soon)', 
      icon: '⭕',
      description: 'Feature in development',
      disabled: true
    }
  ]

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">Logo Shape</p>
      
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.value}
            onClick={() => !shape.disabled && handleShapeChange(shape.value)}
            disabled={loading || shape.disabled}
            className={`relative p-3 rounded-lg border-2 transition-all ${
              shape.disabled 
                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                : logoShape === shape.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } disabled:opacity-50`}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{shape.icon}</span>
              <span className="text-sm font-medium text-gray-900">{shape.label}</span>
              <span className="text-xs text-gray-500 mt-1">{shape.description}</span>
            </div>
            
            {/* Selection indicator */}
            {logoShape === shape.value && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-xs text-indigo-600 mt-2">Updating logo shape...</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}

      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
        💡 <strong>Tip:</strong> Circle shape works best with square logos or icons. The logo will be contained within a circular area.
      </div>
    </div>
  )
}