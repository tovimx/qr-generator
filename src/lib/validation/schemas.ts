import { z } from 'zod'

// Base entity schemas matching Prisma models
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const ProjectSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const DomainSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  primary: z.boolean(),
  verified: z.boolean(),
  type: z.string(),
  clientId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const LinkSchema = z.object({
  id: z.string(),
  qrCodeId: z.string(),
  title: z.string(),
  url: z.string().url(),
  position: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// QR Code schema with all fields from Prisma model - matches actual database schema
export const QRCodeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  shortCode: z.string(),
  title: z.string(),
  isActive: z.boolean(),
  position: z.number(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  redirectType: z.enum(['links', 'url']),
  redirectUrl: z.string().nullable(),
  logoSize: z.number(),
  logoUrl: z.string().nullable(),
  logoShape: z.enum(['square', 'circle']),
  cornerRadius: z.number(),
  fgColor: z.string(),
  clientId: z.string().nullable(),
  domainId: z.string().nullable(),
  projectId: z.string().nullable(), // Nullable by design - QR codes can exist without projects
  preferredDomainId: z.string().nullable(),
})

// Extended schemas with relations - matches API response structure
export const QRCodeDataSchema = QRCodeSchema.extend({
  links: z.array(LinkSchema),
  _count: z.object({
    scans: z.number(),
  }),
  // Project relation: optional field that can be null or undefined
  // - undefined: when project relation is not included in the query
  // - null: when projectId exists but project is deleted
  // - ProjectSchema: when project relation is loaded
  project: ProjectSchema.nullable().optional(),
  preferredDomain: z.object({
    id: z.string(),
    hostname: z.string(),
    primary: z.boolean(),
    verified: z.boolean(),
  }).nullable().optional(),
})

export const ProjectWithStatsSchema = ProjectSchema.extend({
  _count: z.object({
    qrCodes: z.number(),
  }),
  qrCodeCount: z.number(),
  activeQRCount: z.number(),
  totalScans: z.number(),
  lastActivity: z.number(),
})

// API Response schemas
export const QRCodeListResponseSchema = z.object({
  qrCodes: z.array(QRCodeDataSchema),
  total: z.number().optional(),
})

export const ProjectListResponseSchema = z.object({
  projects: z.array(ProjectWithStatsSchema),
  total: z.number().optional(),
})

export const DomainListResponseSchema = z.object({
  domains: z.array(DomainSchema),
  total: z.number().optional(),
})

export const APIErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export const LogoUploadResponseSchema = z.object({
  logoUrl: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
})

// Export types for use in components (derived from schemas)
export type User = z.infer<typeof UserSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Domain = z.infer<typeof DomainSchema>
export type Link = z.infer<typeof LinkSchema>
export type QRCode = z.infer<typeof QRCodeSchema>
export type QRCodeData = z.infer<typeof QRCodeDataSchema>
export type ProjectWithStats = z.infer<typeof ProjectWithStatsSchema>
export type QRCodeListResponse = z.infer<typeof QRCodeListResponseSchema>
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>
export type DomainListResponse = z.infer<typeof DomainListResponseSchema>
export type APIError = z.infer<typeof APIErrorSchema>
export type LogoUploadResponse = z.infer<typeof LogoUploadResponseSchema>