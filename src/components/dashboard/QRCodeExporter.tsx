'use client'

import { useState } from 'react'
import * as htmlToImage from 'html-to-image'

// Props are intentionally unused - component exports the QR code rendered by parent
interface QRCodeExporterProps {
  value?: string
  logoUrl?: string | null
  logoSize?: number
  logoShape?: string
  cornerRadius?: number
  fgColor?: string
}

// Props are passed but not used - the component finds and exports the QR element from DOM
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function QRCodeExporter(props: QRCodeExporterProps) {
  const [exporting, setExporting] = useState(false)
  const [transparentBg, setTransparentBg] = useState(true)

  const downloadQRCode = async (format: 'svg' | 'png', size: number = 1024) => {
    setExporting(true)
    
    try {
      // Find the QR code container
      const element = document.querySelector('.qr-code-container') as HTMLElement
      
      if (!element) {
        console.error('QR code container not found')
        return
      }

      // Find the QR code element (currentSize removed as unused)

      if (format === 'png') {
        // Find the actual QR code element with the export target class
        const qrElement = element.querySelector('.qr-code-export-target') as HTMLElement
        
        if (!qrElement) {
          console.error('QR code export target not found')
          return
        }
        
        // Get current dimensions
        const rect = qrElement.getBoundingClientRect()
        const currentQRSize = rect.width || 256
        
        // Use html-to-image with proper settings
        // The key is using both width/height AND pixelRatio together
        const dataUrl = await htmlToImage.toPng(qrElement, {
          width: currentQRSize,
          height: currentQRSize,
          pixelRatio: size / currentQRSize, // This scales the output to desired size
          backgroundColor: transparentBg ? null : '#ffffff',
          cacheBust: true
        })
        
        // Download the image
        const link = document.createElement('a')
        link.download = `qr-code-${size}px-${Date.now()}.png`
        link.href = dataUrl
        link.click()
        
      } else if (format === 'svg') {
        // Find the actual QR code element with the export target class
        const qrElement = element.querySelector('.qr-code-export-target') as HTMLElement
        
        if (!qrElement) {
          console.error('QR code export target not found')
          return
        }
        
        // For SVG, scale using width/height
        const dataUrl = await htmlToImage.toSvg(qrElement, {
          width: size,
          height: size
        })
        
        // Convert data URL to blob for better compatibility
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        // Download the SVG
        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.svg`
        link.href = url
        link.click()
        
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setTimeout(() => setExporting(false), 500)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">Export QR Code</p>
      
      <div className="space-y-3">
        {/* Background Toggle */}
        <div className="flex items-center justify-between p-2 bg-white rounded-md">
          <span className="text-xs font-medium text-gray-700">Background:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTransparentBg(true)}
              className={`px-3 py-1 text-xs rounded-md ${
                transparentBg 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Transparent
            </button>
            <button
              onClick={() => setTransparentBg(false)}
              className={`px-3 py-1 text-xs rounded-md ${
                !transparentBg 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              White
            </button>
          </div>
        </div>
        {/* SVG Export - Best for designers */}
        <div>
          <p className="text-xs text-gray-600 mb-2 font-semibold">📐 Vector Format (Best for Design)</p>
          <button
            onClick={() => downloadQRCode('svg', 1024)}
            disabled={exporting}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {exporting ? 'Exporting...' : 'Download SVG (Scalable)'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Editable in Illustrator, Figma, Inkscape
          </p>
        </div>

        {/* PNG Exports */}
        <div>
          <p className="text-xs text-gray-600 mb-2 font-semibold">🖼️ PNG Format (Raster)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => downloadQRCode('png', 512)}
              disabled={exporting}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-xs"
            >
              Web (512px)
            </button>
            <button
              onClick={() => downloadQRCode('png', 1024)}
              disabled={exporting}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-xs"
            >
              Print (1024px)
            </button>
            <button
              onClick={() => downloadQRCode('png', 2048)}
              disabled={exporting}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-xs"
            >
              HD (2048px)
            </button>
            <button
              onClick={() => downloadQRCode('png', 4096)}
              disabled={exporting}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 text-xs"
            >
              4K (4096px)
            </button>
          </div>
        </div>

        {/* Format Guide */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p className="font-semibold mb-1">📋 Format Guide:</p>
          <ul className="space-y-1">
            <li>• <strong>SVG</strong>: Best for logos, business cards, any print</li>
            <li>• <strong>512px PNG</strong>: Websites, social media</li>
            <li>• <strong>1024px+ PNG</strong>: Flyers, posters</li>
            <li>• <strong>4K PNG</strong>: Billboards, large displays</li>
          </ul>
        </div>

        {/* Transparency Note */}
        <div className={`p-2 rounded text-xs ${transparentBg ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
          {transparentBg ? (
            <>✨ <strong>Transparent Mode:</strong> QR codes will export with transparent backgrounds for placement on any design.</>
          ) : (
            <>⬜ <strong>White Mode:</strong> QR codes will export with white backgrounds for better visibility on dark surfaces.</>
          )}
        </div>

        {/* Pro Tip */}
        <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 mt-2">
          💡 <strong>Pro Tip:</strong> The logo area keeps a white background for contrast. Designers can edit this in their design software if needed.
        </div>
      </div>
    </div>
  )
}