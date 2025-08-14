'use client'

import { useEffect, useState } from 'react'
import { User, QRCode, Link } from '@prisma/client'
import { useRouter } from 'next/navigation'
import LinkEditor from './LinkEditor'
import LogoUploader from './LogoUploader'
import LogoShapeControl from './LogoShapeControl'
import QRStyleControls from './QRStyleControls'
import QRColorPicker from './QRColorPicker'
import QRCodeExporter from './QRCodeExporter'
import QRCodeWithLogo from './QRCodeWithLogo'
import QRValidationWarning from './QRValidationWarning'
import { getQRCodeUrl, getAppBaseUrl } from '@/lib/utils/qr-code'

interface QRCodeWithRelations extends QRCode {
  links: Link[]
  _count: {
    scans: number
  }
}

interface QRCodeManagerProps {
  user: User & { qrCode: QRCodeWithRelations | null }
  qrCode: QRCodeWithRelations | null
}

export default function QRCodeManager({ user, qrCode: initialQrCode }: QRCodeManagerProps) {
  const [qrCode, setQrCode] = useState(initialQrCode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingDestination, setEditingDestination] = useState(false)
  const [redirectType, setRedirectType] = useState(initialQrCode?.redirectType || 'links')
  const [redirectUrl, setRedirectUrl] = useState(initialQrCode?.redirectUrl || '')
  const router = useRouter()
  const [domains, setDomains] = useState<{ id: string; hostname: string; primary: boolean; verified: boolean }[]>([])
  const [selectedBaseUrl, setSelectedBaseUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const res = await fetch('/api/domains', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const list = (data.domains || []) as { id: string; hostname: string; primary: boolean; verified: boolean }[]
          setDomains(list)
          const primary = list.find(d => d.primary)
          if (primary) {
            setSelectedBaseUrl(`https://${primary.hostname}`)
          }
        }
      } catch {}
    }
    loadDomains()
  }, [])

  const handleCreateQRCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create QR code')
      }

      const newQrCode = await response.json()
      setQrCode(newQrCode)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLinks = async (links: Omit<Link, 'id' | 'qrCodeId' | 'createdAt' | 'updatedAt'>[]) => {
    if (!qrCode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/qr-codes/${qrCode.id}/links`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ links }),
      })

      if (!response.ok) {
        throw new Error('Failed to update links')
      }

      const updatedQrCode = await response.json()
      setQrCode(updatedQrCode)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDestination = async () => {
    if (!qrCode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/qr-codes/${qrCode.id}/destination`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          redirectType,
          redirectUrl: redirectType === 'url' ? redirectUrl : null 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update destination')
      }

      const updatedQrCode = await response.json()
      setQrCode(updatedQrCode)
      setRedirectType(updatedQrCode.redirectType)
      setRedirectUrl(updatedQrCode.redirectUrl || '')
      setEditingDestination(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpdate = async (logoUrl: string | null, logoSize: number, logoShape?: string) => {
    if (!qrCode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/qr-codes/${qrCode.id}/logo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoUrl, logoSize, logoShape }),
      })

      if (!response.ok) {
        throw new Error('Failed to update logo')
      }

      const updatedQrCode = await response.json()
      setQrCode(updatedQrCode)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err // Re-throw to handle in LogoUploader
    } finally {
      setLoading(false)
    }
  }

  const handleStyleUpdate = async (cornerRadius?: number, fgColor?: string) => {
    if (!qrCode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/qr-codes/${qrCode.id}/style`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...(cornerRadius !== undefined && { cornerRadius }),
          ...(fgColor !== undefined && { fgColor })
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update style')
      }

      const updatedQrCode = await response.json()
      setQrCode(updatedQrCode)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  if (!qrCode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven&apos;t created a QR code yet.</p>
        <button
          onClick={handleCreateQRCode}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create QR Code'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    )
  }

  const qrCodeUrl = getQRCodeUrl(qrCode.shortCode, selectedBaseUrl ? { host: selectedBaseUrl } : undefined)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  value={selectedBaseUrl || getAppBaseUrl()}
                  onChange={(e) => setSelectedBaseUrl(e.target.value)}
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
                    className="text-sm text-indigo-600 hover:text-indigo-500"
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
                        onChange={(e) => setRedirectType(e.target.value)}
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
                  <p className="text-sm text-gray-600">
                    {qrCode.redirectType === 'url' && qrCode.redirectUrl
                      ? `Custom URL: ${qrCode.redirectUrl}`
                      : 'Link Page (shows your links below)'}
                  </p>
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
