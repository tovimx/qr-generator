'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useRef, useMemo } from 'react'

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
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Calculate logo dimensions
  const logoPixelSize = logoUrl ? (size * logoSize) / 100 : 0

  // Calculate border radius based on cornerRadius value (0-10)
  const borderRadiusPercent = cornerRadius * 5 // 0% to 50%
  const borderRadiusPx = (size * borderRadiusPercent) / 100
  
  // Create a stable ID for the clip path that doesn't change on every render
  const clipPathId = useMemo(() => `qr-clip-${Math.random().toString(36).substr(2, 9)}`, [])
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const svg = containerRef.current.querySelector('svg')
    if (!svg) return
    
    // If cornerRadius is 0, remove any clip path
    if (cornerRadius === 0) {
      svg.removeAttribute('clip-path')
      svg.style.clipPath = ''
      
      // Clean up any existing clip path definitions
      const defs = svg.querySelector('defs')
      if (defs) {
        const existingClipPath = defs.querySelector(`#${clipPathId}`)
        if (existingClipPath) {
          existingClipPath.remove()
        }
      }
      return
    }
    
    // Apply clip path for rounded corners
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.insertBefore(defs, svg.firstChild)
    }
    
    // Remove old clip path if exists
    const oldClipPath = defs.querySelector(`#${clipPathId}`)
    if (oldClipPath) {
      oldClipPath.remove()
    }
    
    // Create new clip path with rounded rect
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    clipPath.setAttribute('id', clipPathId)
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', '0')
    rect.setAttribute('y', '0')
    rect.setAttribute('width', size.toString())
    rect.setAttribute('height', size.toString())
    rect.setAttribute('rx', borderRadiusPx.toString())
    rect.setAttribute('ry', borderRadiusPx.toString())
    
    clipPath.appendChild(rect)
    defs.appendChild(clipPath)
    
    // Apply the clip path to the SVG
    svg.setAttribute('clip-path', `url(#${clipPathId})`)
    svg.style.clipPath = `url(#${clipPathId})`
  }, [cornerRadius, borderRadiusPx, size, clipPathId])

  return (
    <div 
      ref={containerRef}
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