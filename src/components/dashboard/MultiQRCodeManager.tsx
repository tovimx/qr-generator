'use client'

import { useState, useEffect } from 'react'
import { User } from '@prisma/client'
import QRCodeTabs from './QRCodeTabs'
import QRCodeManager from './QRCodeManager'
import { QRCodeData } from '@/types/qr-code'

interface MultiQRCodeManagerProps {
  user: User
  qrCodes: QRCodeData[]
}

export default function MultiQRCodeManager({ user, qrCodes }: MultiQRCodeManagerProps) {
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(
    qrCodes.length > 0 ? qrCodes[0] : null
  )

  // Update selected QR code when qrCodes data changes (after refresh)
  useEffect(() => {
    if (selectedQRCode) {
      // Find the updated version of the currently selected QR code
      const updatedQRCode = qrCodes.find(qr => qr.id === selectedQRCode.id)
      if (updatedQRCode) {
        setSelectedQRCode(updatedQRCode)
      } else if (qrCodes.length > 0) {
        // If the selected QR code no longer exists, select the first one
        setSelectedQRCode(qrCodes[0])
      } else {
        setSelectedQRCode(null)
      }
    } else if (qrCodes.length > 0) {
      // If no QR code is selected but we have QR codes, select the first one
      setSelectedQRCode(qrCodes[0])
    }
  }, [qrCodes, selectedQRCode])

  const handleQRCodeSelect = (qrCode: QRCodeData) => {
    setSelectedQRCode(qrCode)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <QRCodeTabs
        user={user}
        qrCodes={qrCodes}
        onQRCodeSelect={handleQRCodeSelect}
        selectedQRCode={selectedQRCode}
      />

      {/* Selected QR Code Manager */}
      {selectedQRCode && (
        <QRCodeManager
          qrCode={selectedQRCode}
        />
      )}
    </div>
  )
}