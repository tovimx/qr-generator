import { QRCode, Link, Project } from '@prisma/client'

// Unified QR Code type that extends Prisma model with relations
export interface QRCodeData extends QRCode {
  // Add relations (these don't conflict with base model)
  links: Link[]
  _count: {
    scans: number
  }
  project: Project // Now REQUIRED - every QR code belongs to a project
  preferredDomain?: {
    id: string
    hostname: string
    primary: boolean
    verified: boolean
  } | null
}

// For components that need the relations interface
export interface QRCodeWithRelations extends QRCode {
  // Add relations
  links: Link[]
  project: Project // Now REQUIRED - every QR code belongs to a project
  _count: {
    scans: number
  }
}

// Project interface with calculated stats  
export interface ProjectWithStats extends Project {
  _count: {
    qrCodes: number
  }
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
  projectId: string // REQUIRED - every QR code must belong to a project
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