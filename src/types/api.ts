import { QRCodeData, ProjectWithStats, QRCodeInput, QRCodeUpdateInput } from './qr-code'
import { Project, Domain } from '@prisma/client'

// Generic API response wrapper
export interface APIResponse<T = unknown> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

// QR Code API responses - Use type aliases instead of empty interfaces
export type QRCodeResponse = QRCodeData

export interface QRCodeListResponse {
  qrCodes: QRCodeData[]
  total?: number
}

export type QRCodeCreateResponse = QRCodeData

export type QRCodeUpdateResponse = QRCodeData

// Project API responses - Use type aliases instead of empty interfaces
export type ProjectResponse = Project

export type ProjectWithStatsResponse = ProjectWithStats

export interface ProjectListResponse {
  projects: ProjectWithStats[]
  total?: number
}

// Domain API responses - Use type aliases instead of empty interfaces
export type DomainResponse = Domain

export interface DomainListResponse {
  domains: Domain[]
  total?: number
}

// Request types for API endpoints
export interface QRCodeCreateRequest extends QRCodeInput {
  title?: string
  projectId: string // REQUIRED - every QR code must belong to a project
}

export type QRCodeUpdateRequest = QRCodeUpdateInput

export interface ProjectCreateRequest {
  name: string
}

export interface ProjectUpdateRequest {
  name?: string
  isDefault?: boolean
}

export interface DomainCreateRequest {
  hostname: string
  type?: string
}

export interface DomainUpdateRequest {
  verified?: boolean
  primary?: boolean
}

// Error response types
export interface APIError {
  error: string
  code?: string
  details?: Record<string, unknown>
}

// Bulk operations
export interface BulkUpdateRequest {
  qrCodeIds: string[]
  newPositions: number[]
}

export interface BulkUpdateResponse {
  updated: number
  errors?: string[]
}

// File upload responses
export interface LogoUploadResponse {
  logoUrl: string
  success: boolean
  error?: string
}