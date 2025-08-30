'use client'

import { useEffect, useState } from 'react'
import { Link } from '@prisma/client'
import LinkEditor from './LinkEditor'
import LogoUploader from './LogoUploader'
import LogoShapeControl from './LogoShapeControl'
import QRStyleControls from './QRStyleControls'
import QRColorPicker from './QRColorPicker'
import QRCodeExporter from './QRCodeExporter'
import QRCodeWithLogo from './QRCodeWithLogo'
import QRValidationWarning from './QRValidationWarning'
import { getQRCodeUrl, getAppBaseUrl } from '@/lib/utils/qr-code'
import { QRCodeData } from '@/types/qr-code'
import { useDomains } from '@/hooks/use-domains'
import { useUpdateQRCodeDestination, useUpdateQRCodeLinks, useUpdateQRCodeLogo, useUpdateQRCodeStyle, useUpdateQRCodePreferredDomain } from '@/hooks/use-qr-codes'

interface QRCodeManagerProps {
  qrCode: QRCodeData | null
}

export default function QRCodeManager({ qrCode: initialQrCode }: QRCodeManagerProps) {
  const [qrCode, setQrCode] = useState(initialQrCode)

  // TanStack Query hooks
  const { data: domains = [] } = useDomains()
  const updateDestinationMutation = useUpdateQRCodeDestination()
  const updateLinksMutation = useUpdateQRCodeLinks()
  const updateLogoMutation = useUpdateQRCodeLogo()
  const updateStyleMutation = useUpdateQRCodeStyle()
  const updatePreferredDomainMutation = useUpdateQRCodePreferredDomain()

  // Local state
  const [editingDestination, setEditingDestination] = useState(false)
  const [redirectType, setRedirectType] = useState<'links' | 'url'>(() => 
    (initialQrCode?.redirectType as 'links' | 'url') || 'links'
  )
  const [redirectUrl, setRedirectUrl] = useState(initialQrCode?.redirectUrl || '')
  
  // Simple domain selection: null = localhost, domain-id = custom domain
  const getSelectedDomain = () => {
    if (qrCode?.preferredDomain) {
      // User chose a custom domain
      return `https://${qrCode.preferredDomain.hostname}`
    }
    // null means localhost (either never set or explicitly chosen)
    return getAppBaseUrl()
  }
  
  const loading = updateDestinationMutation.isPending || updateLinksMutation.isPending || updateLogoMutation.isPending || updateStyleMutation.isPending
  const error: string | null = null // Error handling is done by mutations

  // Update local state when the prop changes
  useEffect(() => {
    setQrCode(initialQrCode)
    setRedirectType((initialQrCode?.redirectType as 'links' | 'url') || 'links')
    setRedirectUrl(initialQrCode?.redirectUrl || '')
  }, [initialQrCode])
  
  // Handler for updating preferred domain
  const handleUpdatePreferredDomain = async (domainValue: string) => {
    if (!qrCode) return
    
    let preferredDomainId: string | null = null
    
    // Parse domain value to get domain ID
    if (domainValue === getAppBaseUrl()) {
      // User explicitly chose localhost - we'll use null to represent this
      // but the fact that we're calling this function means it was a choice
      preferredDomainId = null
    } else {
      // User chose a custom domain
      const domain = domains.find(d => `https://${d.hostname}` === domainValue)
      if (domain) {
        preferredDomainId = domain.id
      } else {
        console.warn('Domain not found:', domainValue)
        return // Don't save if domain not found
      }
    }
    
    try {
      const updatedQrCode = await updatePreferredDomainMutation.mutateAsync({
        id: qrCode.id,
        preferredDomainId
      })
      setQrCode(updatedQrCode)
    } catch (error) {
      console.error('Failed to update preferred domain:', error)
    }
  }
  


  const handleUpdateLinks = async (links: Omit<Link, 'id' | 'qrCodeId' | 'createdAt' | 'updatedAt'>[]) => {
    if (!qrCode) return

    try {
      const updatedQrCode = await updateLinksMutation.mutateAsync({
        id: qrCode.id,
        links
      })
      setQrCode(updatedQrCode)
    } catch (err) {
      console.error('Failed to update links:', err)
      // Error handling is done by the mutation hook
    }
  }

  const handleUpdateDestination = async () => {
    if (!qrCode) return

    try {
      const updatedQrCode = await updateDestinationMutation.mutateAsync({
        id: qrCode.id,
        redirectType,
        redirectUrl: redirectType === 'url' ? redirectUrl : null
      })
      setQrCode(updatedQrCode)
      setRedirectType(updatedQrCode.redirectType as 'links' | 'url')
      setRedirectUrl(updatedQrCode.redirectUrl || '')
      setEditingDestination(false)
    } catch (err) {
      console.error('Failed to update destination:', err)
      // Error handling is done by the mutation hook
    }
  }

  const handleLogoUpdate = async (logoUrl: string | null, logoSize: number, logoShape?: string) => {
    if (!qrCode) return

    try {
      const updatedQrCode = await updateLogoMutation.mutateAsync({
        id: qrCode.id,
        logoUrl,
        logoSize,
        logoShape: logoShape as 'square' | 'circle' || 'square'
      })
      setQrCode(updatedQrCode)
    } catch (err) {
      console.error('Failed to update logo:', err)
      throw err // Re-throw to handle in LogoUploader
    }
  }

  const handleStyleUpdate = async (cornerRadius?: number, fgColor?: string, bgColor?: string) => {
    if (!qrCode) return

    try {
      const updatedQrCode = await updateStyleMutation.mutateAsync({
        id: qrCode.id,
        ...(cornerRadius !== undefined && { cornerRadius }),
        ...(fgColor !== undefined && { fgColor }),
        ...(bgColor !== undefined && { bgColor })
      })
      setQrCode(updatedQrCode)
    } catch (err) {
      console.error('Failed to update style:', err)
      throw err
    }
  }

  if (!qrCode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a QR code from the tabs above.</p>
      </div>
    )
  }

  const selectedDomain = getSelectedDomain()
  const qrCodeUrl = getQRCodeUrl(qrCode.shortCode, selectedDomain !== getAppBaseUrl() ? { host: selectedDomain } : undefined)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-qr-id={qrCode.id}>
      <div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Your QR Code
            </h3>
            <div className="flex flex-col items-center">
              {/* Domain selector */}
              <div className="w-full mb-4 flex items-center justify-between">
                <label className="text-sm text-gray-700">Domain to encode:</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => handleUpdatePreferredDomain(e.target.value)}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
                >
                  <option value={getAppBaseUrl()}>Current origin ({getAppBaseUrl()})</option>
                  {domains.map(d => (
                    <option key={d.id} value={`https://${d.hostname}`}>
                      {d.hostname}{d.primary ? ' • primary' : ''}{!d.verified ? ' • unverified' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {/* Preview background to show transparency */}
              <div 
                className="qr-code-container p-4 rounded-lg"
                style={{
                  background: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0), linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px'
                }}
              >
                <QRCodeWithLogo 
                  value={qrCodeUrl} 
                  size={256} 
                  logoUrl={qrCode.logoUrl}
                  logoSize={qrCode.logoSize}
                  logoShape={qrCode.logoShape as 'square' | 'circle' || 'square'}
                  cornerRadius={qrCode.cornerRadius || 0}
                  fgColor={qrCode.fgColor || '#000000'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Transparent background (checkerboard shows transparency)
              </p>
              
              <QRValidationWarning
                logoSize={qrCode.logoSize}
                cornerRadius={qrCode.cornerRadius}
                fgColor={qrCode.fgColor}
                onAutoAdjust={async (adjusted) => {
                  // Auto-adjust logo size
                  if (adjusted.logoSize !== undefined && adjusted.logoSize !== qrCode.logoSize) {
                    await handleLogoUpdate(qrCode.logoUrl, adjusted.logoSize)
                  }
                  // Auto-adjust corner radius
                  if (adjusted.cornerRadius !== undefined && adjusted.cornerRadius !== qrCode.cornerRadius) {
                    await handleStyleUpdate(adjusted.cornerRadius, undefined)
                  }
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Short URL:</p>
                <a 
                  href={qrCodeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {qrCodeUrl}
                </a>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Destination:</p>
                  <button
                    onClick={() => setEditingDestination(!editingDestination)}
                    className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    {editingDestination ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                {editingDestination ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Redirect Type
                      </label>
                      <select
                        value={redirectType}
                        onChange={(e) => setRedirectType(e.target.value as 'links' | 'url')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                      >
                        <option value="links">Link Page (Linktree-style)</option>
                        <option value="url">Custom URL</option>
                      </select>
                    </div>
                    
                    {redirectType === 'url' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom URL
                        </label>
                        <input
                          type="url"
                          value={redirectUrl}
                          onChange={(e) => setRedirectUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={handleUpdateDestination}
                      disabled={loading || (redirectType === 'url' && !redirectUrl)}
                      className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Destination'}
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {qrCode.redirectType === 'url' && qrCode.redirectUrl ? (
                      <div>
                        <p className="font-medium mb-1">Custom URL:</p>
                        <p className="break-all text-indigo-600 bg-gray-50 p-2 rounded border">
                          {qrCode.redirectUrl}
                        </p>
                      </div>
                    ) : (
                      <p>Link Page (shows your links below)</p>
                    )}
                  </div>
                )}
              </div>
              
              <LogoUploader
                qrCodeId={qrCode.id}
                currentLogoUrl={qrCode.logoUrl}
                logoSize={qrCode.logoSize || 30}
                onLogoUpdate={(url, size) => handleLogoUpdate(url, size)}
              />
              
              {qrCode.logoUrl && (
                <LogoShapeControl
                  logoShape={qrCode.logoShape || 'square'}
                  onShapeUpdate={(shape) => handleLogoUpdate(qrCode.logoUrl, qrCode.logoSize || 30, shape)}
                />
              )}
              
              <QRStyleControls
                cornerRadius={qrCode.cornerRadius || 0}
                onStyleUpdate={(cornerRadius) => handleStyleUpdate(cornerRadius, undefined)}
              />
              
              <QRColorPicker
                fgColor={qrCode.fgColor || '#000000'}
                onColorUpdate={(fgColor) => handleStyleUpdate(undefined, fgColor)}
              />
              
              <QRCodeExporter
                value={qrCodeUrl}
                logoUrl={qrCode.logoUrl}
                logoSize={qrCode.logoSize}
                logoShape={qrCode.logoShape || 'square'}
                cornerRadius={qrCode.cornerRadius || 0}
                fgColor={qrCode.fgColor || '#000000'}
                qrCodeId={qrCode.id}
              />
              
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{qrCode._count.scans}</p>
                <p className="text-sm text-gray-500">Total Scans</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {qrCode.redirectType === 'url' ? 'QR Code Settings' : 'Links (Max 5)'}
            </h3>
            {qrCode.redirectType === 'links' ? (
              <>
                <LinkEditor 
                  links={qrCode.links} 
                  onSave={handleUpdateLinks}
                  loading={loading}
                />
                {error && <p className="text-red-600 mt-2">{error}</p>}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">
                  This QR code redirects to a custom URL.
                </p>
                <p className="text-sm text-gray-400">
                  Switch to &quot;Link Page&quot; mode to manage multiple links.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
