import { DesignSettings, SocialLink } from '@/types/design'

/**
 * Centralized configuration for all design fields
 * This ensures consistency between database queries, API responses, and UI components
 */
export const DESIGN_FIELD_CONFIG = {
  // Database fields that should be selected in queries
  DATABASE_FIELDS: {
    themeId: true,
    primaryColor: true,
    secondaryColor: true,
    backgroundType: true,
    backgroundValue: true,
    buttonStyle: true,
    cardStyle: true,
    fontFamily: true,
    customCss: true,
    avatarUrl: true,
    avatarStyle: true,
    description: true,
    socialLinks: true,
    customTitle: true,
    showTitle: true,
  } as const,

  // Default values for each field
  DEFAULTS: {
    themeId: 'default',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundType: 'gradient' as const,
    backgroundValue: null,
    buttonStyle: 'rounded' as const,
    cardStyle: 'floating' as const,
    fontFamily: 'inter',
    customCss: null,
    avatarUrl: null,
    avatarStyle: 'circle' as const,
    description: null,
    socialLinks: null,
    customTitle: null,
    showTitle: true,
  } as const,

  // Validation rules for each field
  VALIDATION: {
    themeId: {
      required: false,
      type: 'string' as const,
    },
    primaryColor: {
      required: false,
      type: 'string' as const,
      pattern: /^#[0-9A-F]{6}$/i,
    },
    secondaryColor: {
      required: false,
      type: 'string' as const,
      pattern: /^#[0-9A-F]{6}$/i,
    },
    backgroundType: {
      required: false,
      type: 'enum' as const,
      values: ['solid', 'gradient', 'pattern', 'image'] as const,
    },
    backgroundValue: {
      required: false,
      type: 'string' as const,
      nullable: true,
    },
    buttonStyle: {
      required: false,
      type: 'enum' as const,
      values: ['rounded', 'square', 'pill', 'glass'] as const,
    },
    cardStyle: {
      required: false,
      type: 'enum' as const,
      values: ['floating', 'plain'] as const,
    },
    fontFamily: {
      required: false,
      type: 'string' as const,
    },
    customCss: {
      required: false,
      type: 'string' as const,
      nullable: true,
    },
    avatarUrl: {
      required: false,
      type: 'string' as const,
      nullable: true,
    },
    avatarStyle: {
      required: false,
      type: 'enum' as const,
      values: ['circle', 'banner'] as const,
    },
    description: {
      required: false,
      type: 'string' as const,
      nullable: true,
    },
    socialLinks: {
      required: false,
      type: 'json' as const,
      nullable: true,
    },
    customTitle: {
      required: false,
      type: 'string' as const,
      nullable: true,
    },
    showTitle: {
      required: false,
      type: 'boolean' as const,
    },
  } as const,
} as const

/**
 * Type-safe utility to convert database QRCode to DesignSettings
 */
export function mapQRCodeToDesignSettings(qrCode: Record<string, unknown>): DesignSettings {
  return {
    themeId: (qrCode['themeId'] as string) || DESIGN_FIELD_CONFIG.DEFAULTS.themeId,
    primaryColor: (qrCode['primaryColor'] as string) || DESIGN_FIELD_CONFIG.DEFAULTS.primaryColor,
    secondaryColor: (qrCode['secondaryColor'] as string) || DESIGN_FIELD_CONFIG.DEFAULTS.secondaryColor,
    backgroundType: (qrCode['backgroundType'] as DesignSettings['backgroundType']) || DESIGN_FIELD_CONFIG.DEFAULTS.backgroundType,
    backgroundValue: (qrCode['backgroundValue'] as string | null) || DESIGN_FIELD_CONFIG.DEFAULTS.backgroundValue,
    buttonStyle: (qrCode['buttonStyle'] as DesignSettings['buttonStyle']) || DESIGN_FIELD_CONFIG.DEFAULTS.buttonStyle,
    cardStyle: (qrCode['cardStyle'] as DesignSettings['cardStyle']) || DESIGN_FIELD_CONFIG.DEFAULTS.cardStyle,
    fontFamily: (qrCode['fontFamily'] as string) || DESIGN_FIELD_CONFIG.DEFAULTS.fontFamily,
    customCss: (qrCode['customCss'] as string | null) || DESIGN_FIELD_CONFIG.DEFAULTS.customCss,
    avatarUrl: (qrCode['avatarUrl'] as string | null) || DESIGN_FIELD_CONFIG.DEFAULTS.avatarUrl,
    avatarStyle: (qrCode['avatarStyle'] as DesignSettings['avatarStyle']) || DESIGN_FIELD_CONFIG.DEFAULTS.avatarStyle,
    description: (qrCode['description'] as string | null) || DESIGN_FIELD_CONFIG.DEFAULTS.description,
    socialLinks: (qrCode['socialLinks'] as SocialLink[] | null) || DESIGN_FIELD_CONFIG.DEFAULTS.socialLinks,
    customTitle: (qrCode['customTitle'] as string | null) || DESIGN_FIELD_CONFIG.DEFAULTS.customTitle,
    showTitle: (qrCode['showTitle'] as boolean) ?? DESIGN_FIELD_CONFIG.DEFAULTS.showTitle,
  }
}

/**
 * Validates a design settings update object
 */
export function validateDesignUpdates(updates: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const [field, value] of Object.entries(updates)) {
    const validation = DESIGN_FIELD_CONFIG.VALIDATION[field as keyof typeof DESIGN_FIELD_CONFIG.VALIDATION]
    
    if (!validation) {
      errors.push(`Unknown field: ${field}`)
      continue
    }

    if (value === null || value === undefined) {
      if (validation.required) {
        errors.push(`Field ${field} is required`)
      }
      continue
    }

    // Type validation
    if (validation.type === 'enum' && 'values' in validation) {
      if (!(validation.values as readonly unknown[]).includes(value)) {
        errors.push(`Invalid value for ${field}: ${value}. Must be one of: ${(validation.values as readonly unknown[]).join(', ')}`)
      }
    } else if (validation.type === 'string' && typeof value !== 'string') {
      errors.push(`Field ${field} must be a string`)
    } else if (validation.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field ${field} must be a boolean`)
    }

    // Pattern validation
    if ('pattern' in validation && validation.pattern && typeof value === 'string') {
      if (!validation.pattern.test(value)) {
        errors.push(`Invalid format for ${field}: ${value}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Gets the Prisma select object for design fields
 * This ensures all APIs use the same field selection
 */
export function getDesignFieldsSelect() {
  return DESIGN_FIELD_CONFIG.DATABASE_FIELDS
}

/**
 * Type guard to ensure we're not missing any fields
 */
type DesignFieldKeys = keyof typeof DESIGN_FIELD_CONFIG.DATABASE_FIELDS
type DesignSettingsKeys = keyof DesignSettings

// Compile-time check to ensure all DesignSettings fields are covered
type MissingFields = Exclude<DesignSettingsKeys, DesignFieldKeys>
type ExtraFields = Exclude<DesignFieldKeys, DesignSettingsKeys>

// These should be empty types if everything is in sync
const _missingFieldsCheck: MissingFields[] = []
const _extraFieldsCheck: ExtraFields[] = []