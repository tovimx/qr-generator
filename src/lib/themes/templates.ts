export interface ThemeTemplate {
  id: string
  name: string
  description: string
  category: 'modern' | 'creative' | 'professional' | 'social' | 'dark' | 'custom'
  preview?: string
  isPremium?: boolean
  styles: {
    primaryColor: string
    secondaryColor: string
    backgroundType: 'solid' | 'gradient' | 'pattern' | 'image'
    backgroundValue: string
    buttonStyle: 'rounded' | 'square' | 'pill' | 'glass'
    fontFamily: string
    cardStyle?: 'floating' | 'plain'
  }
  customCss?: string | null
  avatarUrl?: string | null
  socialLinks?: unknown
  customTitle?: string | null
  showTitle?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'Clean and simple design with purple gradient',
    category: 'modern',
    preview: '/themes/classic-preview.jpg',
    styles: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #ef4444 100%)',
      buttonStyle: 'rounded',
      fontFamily: 'inter',
      cardStyle: 'floating'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal White',
    description: 'Clean white design with subtle shadows',
    category: 'modern',
    preview: '/themes/minimal-preview.jpg',
    styles: {
      primaryColor: '#374151',
      secondaryColor: '#6b7280',
      backgroundType: 'solid',
      backgroundValue: '#f9fafb',
      buttonStyle: 'rounded',
      fontFamily: 'inter',
      cardStyle: 'floating'
    }
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Professional blue theme for business use',
    category: 'professional',
    preview: '/themes/corporate-preview.jpg',
    styles: {
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      buttonStyle: 'rounded',
      fontFamily: 'roboto',
      cardStyle: 'floating'
    }
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    description: 'Dark theme with neon accents',
    category: 'dark',
    preview: '/themes/neon-dark-preview.jpg',
    styles: {
      primaryColor: '#10b981',
      secondaryColor: '#06d6a0',
      backgroundType: 'solid',
      backgroundValue: '#111827',
      buttonStyle: 'glass',
      fontFamily: 'poppins',
      cardStyle: 'floating'
    }
  },
  {
    id: 'social-pink',
    name: 'Social Pink',
    description: 'Instagram-inspired pink and orange theme',
    category: 'social',
    preview: '/themes/social-pink-preview.jpg',
    styles: {
      primaryColor: '#ec4899',
      secondaryColor: '#f97316',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(45deg, #ec4899 0%, #f97316 100%)',
      buttonStyle: 'pill',
      fontFamily: 'poppins',
      cardStyle: 'floating'
    }
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Organic earth tones with green accents',
    category: 'creative',
    preview: '/themes/nature-green-preview.jpg',
    styles: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
      buttonStyle: 'rounded',
      fontFamily: 'inter',
      cardStyle: 'floating'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    description: 'Warm orange and red sunset colors',
    category: 'creative',
    preview: '/themes/sunset-preview.jpg',
    isPremium: true,
    styles: {
      primaryColor: '#f97316',
      secondaryColor: '#ef4444',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(45deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
      buttonStyle: 'pill',
      fontFamily: 'poppins',
      cardStyle: 'floating'
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Deep blue ocean-inspired theme',
    category: 'creative',
    preview: '/themes/ocean-blue-preview.jpg',
    isPremium: true,
    styles: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#06b6d4',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 50%, #06b6d4 100%)',
      buttonStyle: 'glass',
      fontFamily: 'inter',
      cardStyle: 'floating'
    }
  }
]

export const getThemeById = (id: string): ThemeTemplate | undefined => {
  return themeTemplates.find(theme => theme.id === id)
}

export const getThemesByCategory = (category: ThemeTemplate['category']): ThemeTemplate[] => {
  return themeTemplates.filter(theme => theme.category === category)
}

export const getFreeThemes = (): ThemeTemplate[] => {
  return themeTemplates.filter(theme => !theme.isPremium)
}

export const getPremiumThemes = (): ThemeTemplate[] => {
  return themeTemplates.filter(theme => theme.isPremium)
}