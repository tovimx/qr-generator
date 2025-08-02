'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { User, QRCode, Link } from '@prisma/client'
import { useRouter } from 'next/navigation'
import LinkEditor from './LinkEditor'
import { getQRCodeUrl } from '@/lib/utils/qr-code'

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
  const router = useRouter()

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

  const qrCodeUrl = getQRCodeUrl(qrCode.shortCode)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Your QR Code
            </h3>
            <div className="flex flex-col items-center">
              <QRCodeSVG value={qrCodeUrl} size={256} />
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
              Links (Max 5)
            </h3>
            <LinkEditor 
              links={qrCode.links} 
              onSave={handleUpdateLinks}
              loading={loading}
            />
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}