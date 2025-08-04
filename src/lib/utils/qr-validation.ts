/**
 * QR Code Scannability Validation
 * Provides risk assessment for QR code configurations
 */

export interface QRValidationResult {
  isValid: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  warnings: string[]
  suggestions: string[]
}

export interface QRConfiguration {
  logoSize?: number // percentage (0-40)
  cornerRadius?: number // 0-10 scale
  fgColor?: string // hex color
  bgColor?: string // hex color (for contrast check)
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Calculate color contrast ratio between two hex colors
 */
function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number, g: number, b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  const lum1 = getLuminance(rgb1)
  const lum2 = getLuminance(rgb2)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Validate QR code configuration for scannability
 */
export function validateQRScannability(config: QRConfiguration): QRValidationResult {
  const warnings: string[] = []
  const suggestions: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

  // Check logo size
  if (config.logoSize !== undefined) {
    if (config.logoSize > 35) {
      warnings.push('Logo is very large and may prevent scanning')
      suggestions.push('Reduce logo size to 30% or less')
      riskLevel = 'critical'
    } else if (config.logoSize > 30) {
      warnings.push('Logo size is at the upper limit')
      suggestions.push('Consider reducing logo size to 25% for better reliability')
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
    } else if (config.logoSize > 25) {
      // This is acceptable with high error correction
      if (config.errorCorrection !== 'H') {
        warnings.push('Large logo requires high error correction')
        suggestions.push('Using high error correction (H) for better scanning')
      }
    }
  }

  // Check corner radius
  if (config.cornerRadius !== undefined) {
    const radiusPercent = config.cornerRadius * 5 // 0-50%
    
    if (radiusPercent >= 50) {
      warnings.push('Fully rounded QR codes are not scannable')
      suggestions.push('Reduce corner radius to 5 or less (25% rounding)')
      riskLevel = 'critical'
    } else if (radiusPercent > 30) {
      warnings.push('High corner radius may affect scanning')
      suggestions.push('Reduce corner radius to 6 or less for better reliability')
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high'
    } else if (radiusPercent > 20) {
      warnings.push('Corner radius is approaching the safe limit')
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
    }
  }

  // Check combined logo + corner radius risk
  if (config.logoSize && config.cornerRadius) {
    const combinedRisk = (config.logoSize / 100) + (config.cornerRadius / 10)
    
    if (combinedRisk > 0.6) {
      warnings.push('Combination of large logo and rounded corners is risky')
      suggestions.push('Reduce either logo size or corner radius')
      riskLevel = riskLevel === 'low' || riskLevel === 'medium' ? 'high' : riskLevel
    }
    
    if (combinedRisk > 0.8) {
      warnings.push('This combination will likely fail to scan')
      suggestions.push('Significantly reduce logo size or corner radius')
      riskLevel = 'critical'
    }
  }

  // Check color contrast
  if (config.fgColor && config.bgColor) {
    const contrast = getContrastRatio(config.fgColor, config.bgColor || '#ffffff')
    
    if (contrast < 3) {
      warnings.push('Very low color contrast will prevent scanning')
      suggestions.push('Use darker foreground color or lighter background')
      riskLevel = 'critical'
    } else if (contrast < 4.5) {
      warnings.push('Low color contrast may affect scanning')
      suggestions.push('Increase contrast between QR code and background')
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high'
    } else if (contrast < 7) {
      warnings.push('Color contrast could be better')
      suggestions.push('Consider using black (#000000) for best results')
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
    }
  }

  // Special check for light colors on transparent/white background
  if (config.fgColor) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(config.fgColor)
    if (rgb) {
      const brightness = (parseInt(rgb[1], 16) + parseInt(rgb[2], 16) + parseInt(rgb[3], 16)) / 3
      if (brightness > 128) {
        warnings.push('Light QR colors are difficult to scan')
        suggestions.push('Use a darker color for better scanning')
        riskLevel = riskLevel === 'low' || riskLevel === 'medium' ? 'high' : riskLevel
      }
    }
  }

  // Determine if configuration is valid
  const isValid = riskLevel !== 'critical'

  // Add general suggestions based on risk level
  if (riskLevel === 'critical') {
    suggestions.unshift('⚠️ This QR code configuration will likely NOT scan!')
  } else if (riskLevel === 'high') {
    suggestions.unshift('⚠️ This configuration may have scanning issues')
  } else if (riskLevel === 'medium') {
    suggestions.unshift('ℹ️ Configuration is acceptable but could be optimized')
  } else {
    suggestions.unshift('✅ QR code configuration looks good!')
  }

  return {
    isValid,
    riskLevel,
    warnings,
    suggestions
  }
}

/**
 * Get recommended safe limits
 */
export function getSafeLimits() {
  return {
    logoSize: {
      optimal: 20,
      maximum: 30,
      critical: 35
    },
    cornerRadius: {
      optimal: 3, // 15% rounding
      maximum: 5, // 25% rounding
      critical: 8  // 40% rounding
    },
    colorContrast: {
      optimal: 7,
      minimum: 4.5,
      critical: 3
    }
  }
}

/**
 * Auto-adjust configuration to safe values
 */
export function autoAdjustToSafe(config: QRConfiguration): QRConfiguration {
  const adjusted = { ...config }
  const limits = getSafeLimits()

  // Adjust logo size
  if (adjusted.logoSize && adjusted.logoSize > limits.logoSize.maximum) {
    adjusted.logoSize = limits.logoSize.maximum
  }

  // Adjust corner radius
  if (adjusted.cornerRadius && adjusted.cornerRadius > limits.cornerRadius.maximum) {
    adjusted.cornerRadius = limits.cornerRadius.maximum
  }

  // If both are high, reduce both proportionally
  if (adjusted.logoSize && adjusted.cornerRadius) {
    const combinedRisk = (adjusted.logoSize / 100) + (adjusted.cornerRadius / 10)
    if (combinedRisk > 0.55) {
      // Scale both down proportionally
      const scaleFactor = 0.55 / combinedRisk
      adjusted.logoSize = Math.round(adjusted.logoSize * scaleFactor)
      adjusted.cornerRadius = Math.round(adjusted.cornerRadius * scaleFactor)
    }
  }

  return adjusted
}