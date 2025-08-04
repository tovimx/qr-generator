'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeWithLogoProps {
  value: string
  size?: number
  logoUrl?: string | null
  logoSize?: number // percentage of QR code size (10-40)
  logoShape?: 'square' | 'circle' // Shape of logo and excavation
  cornerRadius?: number // 0-10 for corner rounding
  fgColor?: string // QR module color
}

export default function QRCodeWithLogo({ 
  value, 
  size = 256, 
  logoUrl, 
  logoSize = 30,
  logoShape = 'square',
  cornerRadius = 0,
  fgColor = '#000000'
}: QRCodeWithLogoProps) {
  // Calculate logo dimensions
  const logoPixelSize = logoUrl ? (size * logoSize) / 100 : 0

  // Calculate border radius based on cornerRadius value (0-10)
  const borderRadiusPercent = cornerRadius * 5 // 0% to 50%
  const borderRadiusPx = (size * borderRadiusPercent) / 100

  return (
    <div 
      className="relative inline-block overflow-hidden qr-code-export-target"
      style={{
        borderRadius: `${borderRadiusPx}px`,
        width: size,
        height: size,
        backgroundColor: 'transparent'
      }}
    >
      <QRCodeSVG 
        value={value} 
        size={size}
        level="H" // High error correction for better logo tolerance
        includeMargin={false}
        bgColor="transparent" // Make QR background transparent
        fgColor={fgColor} // QR modules color
        imageSettings={logoUrl ? {
          src: logoUrl,
          height: logoPixelSize,
          width: logoPixelSize,
          excavate: true, // This creates a square clear space
        } : undefined}
        style={{
          display: 'block'
        }}
      />
      
      {/* Note about circular excavation limitation */}
      {logoUrl && logoShape === 'circle' && (
        <div className="sr-only">
          Note: The QR code library only supports square excavation. 
          The logo area will remain square even when circle shape is selected.
        </div>
      )}
    </div>
  )
}