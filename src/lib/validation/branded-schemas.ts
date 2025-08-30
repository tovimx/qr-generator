/**
 * Branded Zod Schemas with Type-Safe IDs
 * 
 * This module provides Zod schemas that use branded types for IDs,
 * ensuring type safety while maintaining runtime validation.
 */

import { z } from 'zod'
import type {
  ProjectId, QRCodeId, DomainId,
  BrandedUser, BrandedProject, BrandedQRCode, BrandedDomain, BrandedLink
} from './branded-types'
import {
  createUserId, createClientId, createProjectId, 
  createQRCodeId, createDomainId, createLinkId
} from './branded-types'

/**
 * Branded ID schemas that transform strings to branded types
 */
const UserIdSchema = z.string().transform(createUserId)
const ClientIdSchema = z.string().transform(createClientId)
const ProjectIdSchema = z.string().transform(createProjectId)
const QRCodeIdSchema = z.string().transform(createQRCodeId)
const DomainIdSchema = z.string().transform(createDomainId)
const LinkIdSchema = z.string().transform(createLinkId)

/**
 * Nullable branded ID schemas
 */
const NullableClientIdSchema = z.string().nullable().transform((id: string | null) => id ? createClientId(id) : null)
const NullableProjectIdSchema = z.string().nullable().transform((id: string | null) => id ? createProjectId(id) : null)
const NullableDomainIdSchema = z.string().nullable().transform((id: string | null) => id ? createDomainId(id) : null)

/**
 * Branded entity schemas
 */
export const BrandedUserSchema = z.object({
  id: UserIdSchema,
  email: z.string().email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<BrandedUser>

export const BrandedProjectSchema = z.object({
  id: ProjectIdSchema,
  clientId: ClientIdSchema,
  name: z.string(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<BrandedProject>

export const BrandedDomainSchema = z.object({
  id: DomainIdSchema,
  hostname: z.string(),
  primary: z.boolean(),
  verified: z.boolean(),
  type: z.string(),
  clientId: ClientIdSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<BrandedDomain>

export const BrandedLinkSchema = z.object({
  id: LinkIdSchema,
  qrCodeId: QRCodeIdSchema,
  title: z.string(),
  url: z.string().url(),
  position: z.number(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<BrandedLink>

/**
 * QR Code schema with branded IDs
 */
export const BrandedQRCodeSchema = z.object({
  id: QRCodeIdSchema,
  userId: UserIdSchema,
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
  clientId: NullableClientIdSchema,
  domainId: NullableDomainIdSchema,
  projectId: NullableProjectIdSchema,
  preferredDomainId: NullableDomainIdSchema,
}) satisfies z.ZodType<BrandedQRCode>

/**
 * Extended schemas with relations using branded types
 */
export const BrandedQRCodeDataSchema = BrandedQRCodeSchema.extend({
  links: z.array(BrandedLinkSchema),
  _count: z.object({
    scans: z.number(),
  }),
  project: BrandedProjectSchema.nullable().optional(),
  preferredDomain: z.object({
    id: DomainIdSchema,
    hostname: z.string(),
    primary: z.boolean(),
    verified: z.boolean(),
  }).nullable().optional(),
})

export const BrandedProjectWithStatsSchema = BrandedProjectSchema.extend({
  _count: z.object({
    qrCodes: z.number(),
  }),
  qrCodeCount: z.number(),
  activeQRCount: z.number(),
  totalScans: z.number(),
  lastActivity: z.number(),
})

/**
 * API Response schemas with branded types
 */
export const BrandedQRCodeListResponseSchema = z.object({
  qrCodes: z.array(BrandedQRCodeDataSchema),
  total: z.number().optional(),
})

export const BrandedProjectListResponseSchema = z.object({
  projects: z.array(BrandedProjectWithStatsSchema),
  total: z.number().optional(),
})

export const BrandedDomainListResponseSchema = z.object({
  domains: z.array(BrandedDomainSchema),
  total: z.number().optional(),
})

/**
 * Input schemas for mutations - these accept string IDs and transform them to branded types
 */
export const CreateQRCodeInputSchema = z.object({
  title: z.string().min(1),
  projectId: z.string().transform(createProjectId),
})

export const UpdateQRCodeInputSchema = z.object({
  id: z.string().transform(createQRCodeId),
  title: z.string().min(1).optional(),
  redirectType: z.enum(['links', 'url']).optional(),
  redirectUrl: z.string().url().nullable().optional(),
  fgColor: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  logoSize: z.number().min(0).max(100).optional(),
  logoShape: z.enum(['square', 'circle']).optional(),
  cornerRadius: z.number().min(0).max(50).optional(),
})

export const UpdateQRCodeDestinationInputSchema = z.object({
  id: z.string().transform(createQRCodeId),
  redirectType: z.enum(['links', 'url']),
  redirectUrl: z.string().url().nullable().optional(),
})

export const UpdateQRCodeLinksInputSchema = z.object({
  id: z.string().transform(createQRCodeId),
  links: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url(),
    position: z.number().min(0),
  })),
})

export const CreateProjectInputSchema = z.object({
  name: z.string().min(1).max(100),
})

export const UpdateProjectInputSchema = z.object({
  id: z.string().transform(createProjectId),
  name: z.string().min(1).max(100),
})

export const CreateDomainInputSchema = z.object({
  hostname: z.string().min(1),
})

/**
 * Export types derived from branded schemas
 */
export type BrandedQRCodeData = z.infer<typeof BrandedQRCodeDataSchema>
export type BrandedProjectWithStats = z.infer<typeof BrandedProjectWithStatsSchema>
export type BrandedQRCodeListResponse = z.infer<typeof BrandedQRCodeListResponseSchema>
export type BrandedProjectListResponse = z.infer<typeof BrandedProjectListResponseSchema>
export type BrandedDomainListResponse = z.infer<typeof BrandedDomainListResponseSchema>

export type CreateQRCodeInput = z.infer<typeof CreateQRCodeInputSchema>
export type UpdateQRCodeInput = z.infer<typeof UpdateQRCodeInputSchema>
export type UpdateQRCodeDestinationInput = z.infer<typeof UpdateQRCodeDestinationInputSchema>
export type UpdateQRCodeLinksInput = z.infer<typeof UpdateQRCodeLinksInputSchema>
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>
export type CreateDomainInput = z.infer<typeof CreateDomainInputSchema>

/**
 * Type guards for branded types
 */
export const isBrandedQRCodeId = (value: unknown): value is QRCodeId => {
  return typeof value === 'string' && value.length > 0
}

export const isBrandedProjectId = (value: unknown): value is ProjectId => {
  return typeof value === 'string' && value.length > 0
}

export const isBrandedDomainId = (value: unknown): value is DomainId => {
  return typeof value === 'string' && value.length > 0
}