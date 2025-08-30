import { QRCode, Link, Project } from '@prisma/client'

// Unified QR Code type that extends Prisma model with relations
export interface QRCodeData extends QRCode {
  links: Link[]
  _count: {
    scans: number
  }
  project?: Project | null
}

// For components that need the relations interface
export interface QRCodeWithRelations extends QRCode {
  links: Link[]
  _count: {
    scans: number
  }
}

// Project interface with calculated stats
export interface ProjectWithStats {
  id: string
  name: string
  isDefault: boolean
  qrCodeCount: number
  activeQRCount: number
  totalScans: number
  lastActivity: number
}

// Link type for forms and creation
export interface LinkInput {
  title: string
  url: string
  position: number
  isActive: boolean
}

// QR Code creation/update types
export interface QRCodeInput {
  title?: string
  projectId?: string
  redirectType?: string
  redirectUrl?: string
  logoSize?: number
  logoUrl?: string
  logoShape?: string
  cornerRadius?: number
  fgColor?: string
}

export interface QRCodeUpdateInput extends Partial<QRCodeInput> {
  isActive?: boolean
  position?: number
}