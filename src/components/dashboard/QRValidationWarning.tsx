'use client'

import { useEffect, useState } from 'react'
import { validateQRScannability, autoAdjustToSafe, type QRConfiguration, type QRValidationResult } from '@/lib/utils/qr-validation'

interface QRValidationWarningProps {
  logoSize?: number
  cornerRadius?: number
  fgColor?: string
  onAutoAdjust?: (adjusted: QRConfiguration) => void
}

export default function QRValidationWarning({ 
  logoSize, 
  cornerRadius, 
  fgColor,
  onAutoAdjust
}: QRValidationWarningProps) {
  const [validation, setValidation] = useState<QRValidationResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const config: QRConfiguration = {
      logoSize,
      cornerRadius,
      fgColor,
      bgColor: '#ffffff', // Assume white background for now
      errorCorrection: 'H'
    }

    const result = validateQRScannability(config)
    setValidation(result)

    // Auto-show details for high/critical risk
    if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
      setShowDetails(true)
    }
  }, [logoSize, cornerRadius, fgColor])

  if (!validation || validation.riskLevel === 'low') {
    return null // Don't show anything for low risk
  }

  const handleAutoAdjust = () => {
    if (onAutoAdjust) {
      const adjusted = autoAdjustToSafe({
        logoSize,
        cornerRadius,
        fgColor
      })
      onAutoAdjust(adjusted)
    }
  }

  const getRiskColor = () => {
    switch (validation.riskLevel) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800'
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      default: return 'bg-blue-50 border-blue-200 text-blue-700'
    }
  }

  const getRiskIcon = () => {
    switch (validation.riskLevel) {
      case 'critical': return '🚫'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      default: return 'ℹ️'
    }
  }

  return (
    <div className={`mt-4 p-3 rounded-lg border ${getRiskColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRiskIcon()}</span>
            <p className="font-semibold text-sm">
              QR Code Scannability {validation.riskLevel === 'critical' ? 'Issue' : 'Warning'}
            </p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs underline ml-auto"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {/* Main suggestion */}
          <p className="text-xs mt-1 ml-7">
            {validation.suggestions[0]}
          </p>

          {/* Detailed warnings and suggestions */}
          {showDetails && (
            <div className="mt-3 ml-7 space-y-2">
              {validation.warnings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1">Issues:</p>
                  <ul className="text-xs space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validation.suggestions.length > 1 && (
                <div>
                  <p className="text-xs font-semibold mb-1">Recommendations:</p>
                  <ul className="text-xs space-y-1">
                    {validation.suggestions.slice(1).map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span>→</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auto-adjust button for critical/high risk */}
              {(validation.riskLevel === 'critical' || validation.riskLevel === 'high') && onAutoAdjust && (
                <div className="pt-2">
                  <button
                    onClick={handleAutoAdjust}
                    className="px-3 py-1 bg-white rounded-md text-xs font-medium hover:bg-gray-50 border"
                  >
                    🔧 Auto-Adjust to Safe Values
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Risk level indicator */}
      <div className="mt-3 ml-7">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold">Risk Level:</span>
          <div className="flex gap-1">
            {['low', 'medium', 'high', 'critical'].map((level) => (
              <div
                key={level}
                className={`w-8 h-2 rounded-full ${
                  level === 'low' ? 'bg-green-400' :
                  level === 'medium' ? 'bg-yellow-400' :
                  level === 'high' ? 'bg-orange-400' :
                  'bg-red-400'
                } ${
                  ['low', 'medium', 'high', 'critical'].indexOf(level) <= 
                  ['low', 'medium', 'high', 'critical'].indexOf(validation.riskLevel) 
                    ? 'opacity-100' 
                    : 'opacity-20'
                }`}
              />
            ))}
          </div>
          <span className="capitalize">{validation.riskLevel}</span>
        </div>
      </div>
    </div>
  )
}