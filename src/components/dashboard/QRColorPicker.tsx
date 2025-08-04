'use client'

import { useState } from 'react'

interface QRColorPickerProps {
  fgColor: string
  onColorUpdate: (fgColor: string) => Promise<void>
}

export default function QRColorPicker({ fgColor, onColorUpdate }: QRColorPickerProps) {
  const [color, setColor] = useState(fgColor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Preset colors
  const presets = [
    { name: 'Classic Black', color: '#000000' },
    { name: 'Navy Blue', color: '#1e3a8a' },
    { name: 'Forest Green', color: '#064e3b' },
    { name: 'Burgundy', color: '#7f1d1d' },
    { name: 'Purple', color: '#581c87' },
    { name: 'Teal', color: '#134e4a' },
    { name: 'Orange', color: '#c2410c' },
    { name: 'Pink', color: '#be185d' },
  ]

  const handleColorChange = async (newColor: string) => {
    setColor(newColor)
    setLoading(true)
    setError(null)

    try {
      await onColorUpdate(newColor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update color')
      // Revert color on error
      setColor(fgColor)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">QR Code Color</p>
      
      <div className="space-y-3">
        {/* Color Picker Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                disabled={loading}
                className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    handleColorChange(value)
                  } else {
                    setColor(value) // Allow typing but don't save invalid colors
                  }
                }}
                disabled={loading}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Preset Colors */}
        <div>
          <p className="text-xs text-gray-600 mb-2">Quick Presets:</p>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.color}
                onClick={() => handleColorChange(preset.color)}
                disabled={loading}
                className={`relative group p-2 rounded-md border-2 transition-all ${
                  color === preset.color 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } disabled:opacity-50`}
                title={preset.name}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-xs text-gray-700 truncate flex-1">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <p className="text-xs text-indigo-600">Updating color...</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        {/* Color Warning */}
        <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-700">
          ⚠️ <strong>Important:</strong> Use dark colors for best QR code scannability. Light colors may not scan properly.
        </div>

        {/* Current Color Display */}
        <div className="flex items-center justify-between p-2 bg-white rounded-md">
          <span className="text-xs font-medium text-gray-700">Current Color:</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600 font-mono">{color}</span>
          </div>
        </div>
      </div>
    </div>
  )
}