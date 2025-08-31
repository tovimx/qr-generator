'use client'

import { DesignSettings, SocialLink } from '@/types/design'

interface ThemeRendererProps {
  design: DesignSettings
  title: string
  description?: string | null
  avatarUrl?: string | null
  links: Array<{
    id: string
    title: string
    url: string
    position: number
    isActive: boolean
  }>
  socialLinks?: SocialLink[] | null
  className?: string
}

export function ThemeRenderer({
  design,
  title,
  description,
  avatarUrl,
  links,
  socialLinks,
  className = '',
}: ThemeRendererProps) {
  // const theme = getThemeById(design.themeId) // Currently unused
  
  // Get background style based on type
  const getBackgroundStyle = () => {
    switch (design.backgroundType) {
      case 'solid':
        return { backgroundColor: design.backgroundValue || design.primaryColor }
      case 'gradient':
        return { background: design.backgroundValue || `linear-gradient(135deg, ${design.primaryColor} 0%, ${design.secondaryColor} 100%)` }
      case 'pattern':
        return {
          backgroundColor: design.primaryColor,
          backgroundImage: design.backgroundValue || 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      case 'image':
        return {
          backgroundImage: design.backgroundValue ? `url(${design.backgroundValue})` : 'none',
          backgroundColor: design.primaryColor,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      default:
        return { background: `linear-gradient(135deg, ${design.primaryColor} 0%, ${design.secondaryColor} 100%)` }
    }
  }

  // Get button style classes
  const getButtonClasses = () => {
    const baseClasses = 'block w-full p-4 transition-all duration-200 text-center font-medium'
    
    switch (design.buttonStyle) {
      case 'rounded':
        return `${baseClasses} rounded-lg`
      case 'square':
        return `${baseClasses} rounded-none`
      case 'pill':
        return `${baseClasses} rounded-full`
      case 'glass':
        return `${baseClasses} rounded-lg backdrop-blur-sm bg-white/20 border border-white/30`
      default:
        return `${baseClasses} rounded-lg`
    }
  }

  // Get card style classes
  const getCardClasses = () => {
    const cardStyle = design.cardStyle || 'floating'
    const baseClasses = 'max-w-md mx-auto'
    
    switch (cardStyle) {
      case 'floating':
        return `${baseClasses} rounded-2xl p-8 bg-white shadow-xl`
      case 'plain':
        return `${baseClasses} p-8`
      default:
        return `${baseClasses} rounded-2xl p-8 bg-white shadow-xl`
    }
  }

  // Get font family
  const getFontFamily = () => {
    switch (design.fontFamily) {
      case 'inter':
        return 'font-sans'
      case 'roboto':
        return 'font-sans'
      case 'poppins':
        return 'font-sans'
      default:
        return 'font-sans'
    }
  }

  const activeSocialLinks = socialLinks?.filter(link => link.display) || []

  return (
    <div 
      className={`min-h-screen ${getFontFamily()} ${className} flex flex-col`}
      style={getBackgroundStyle()}
    >
      <div className="px-4 py-16 flex-1 flex flex-col">
        {/* Banner Avatar - positioned outside the card */}
        {avatarUrl && design.avatarStyle === 'banner' && (
          <div className="max-w-md mx-auto mb-8">
            <img
              src={avatarUrl}
              alt={title}
              className="w-full h-24 object-cover rounded-lg shadow-lg"
              style={{ aspectRatio: '4/1' }}
            />
          </div>
        )}

        <div className={getCardClasses()}>
          {/* Circle Avatar - positioned inside the card */}
          {avatarUrl && (design.avatarStyle || 'circle') === 'circle' && (
            <div className="flex justify-center mb-6">
              <img
                src={avatarUrl}
                alt={title}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          )}

          {/* Title */}
          {design.showTitle !== false && (
            <h1 
              className="text-2xl font-bold text-center mb-4 text-gray-800"
              style={{ color: design.primaryColor }}
            >
              {design.customTitle || title || "My Links"}
            </h1>
          )}

          {/* Description */}
          {description && (
            <p className="text-center text-gray-600 mb-8 leading-relaxed">
              {description}
            </p>
          )}

          {/* Social Links */}
          {activeSocialLinks.length > 0 && (
            <div className="flex justify-center gap-4 mb-8">
              {activeSocialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                  style={{ backgroundColor: design.secondaryColor }}
                >
                  <span className="text-sm font-bold">
                    {social.platform.charAt(0).toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Links */}
          {links.length === 0 ? (
            <p className="text-center text-gray-500">No links available yet.</p>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getButtonClasses()}
                  style={{
                    backgroundColor: design.buttonStyle === 'glass' ? 'transparent' : 'rgba(0,0,0,0.05)',
                    color: design.primaryColor,
                    borderColor: design.buttonStyle === 'glass' ? design.primaryColor + '30' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (design.buttonStyle !== 'glass') {
                      e.currentTarget.style.backgroundColor = design.primaryColor
                      e.currentTarget.style.color = 'white'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (design.buttonStyle !== 'glass') {
                      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'
                      e.currentTarget.style.color = design.primaryColor
                    }
                  }}
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Custom CSS */}
        {design.customCss && (
          <style dangerouslySetInnerHTML={{ __html: design.customCss }} />
        )}

        
        <div className="mt-auto pt-8">
          <p className="text-center text-black text-sm opacity-60">
            Powered by PlanoDigital
          </p>
        </div>
      </div>
    </div>
  )
}