export interface DesignSettings {
  themeId: string
  primaryColor: string
  secondaryColor: string
  backgroundType: 'solid' | 'gradient' | 'pattern' | 'image'
  backgroundValue?: string | null
  buttonStyle: 'rounded' | 'square' | 'pill' | 'glass'
  cardStyle?: 'floating' | 'plain'
  fontFamily: string
  customCss?: string | null
  avatarUrl?: string | null
  avatarStyle?: 'circle' | 'banner'
  description?: string | null
  socialLinks?: SocialLink[] | null
  customTitle?: string | null
  showTitle?: boolean
}

export interface SocialLink {
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'website'
  url: string
  display: boolean
}

export interface QRCodeWithDesign {
  id: string
  title: string
  themeId: string
  primaryColor: string
  secondaryColor: string
  backgroundType: string
  backgroundValue?: string | null
  buttonStyle: string
  fontFamily: string
  customCss?: string | null
  avatarUrl?: string | null
  description?: string | null
  socialLinks?: SocialLink[] | null
  links: Array<{
    id: string
    title: string
    url: string
    position: number
    isActive: boolean
  }>
}

export interface ThemePreview {
  themeId: string
  customizations?: Partial<DesignSettings>
}