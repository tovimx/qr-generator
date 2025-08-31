'use client'

import { useState } from 'react'
import { Instagram, Twitter, Facebook, Linkedin, Music, Youtube, Globe } from 'lucide-react'
import { DesignSettings, SocialLink } from '@/types/design'

interface DesignCustomizerProps {
  design: DesignSettings
  onChange: (updates: Partial<DesignSettings>) => void
  className?: string
}

export function DesignCustomizer({
  design,
  onChange,
  className = '',
}: DesignCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'layout' | 'social' | 'advanced'>('colors')
  
  const tabs = [
    { id: 'colors' as const, name: 'Colors', icon: '🎨' },
    { id: 'layout' as const, name: 'Layout', icon: '📐' },
    { id: 'social' as const, name: 'Social', icon: '🔗' },
    { id: 'advanced' as const, name: 'Advanced', icon: '⚙️' },
  ]

  const backgroundTypes = [
    { value: 'solid', name: 'Solid Color' },
    { value: 'gradient', name: 'Gradient' },
    { value: 'pattern', name: 'Pattern' },
    { value: 'image', name: 'Image' },
  ]

  const buttonStyles = [
    { value: 'rounded', name: 'Rounded' },
    { value: 'square', name: 'Square' },
    { value: 'pill', name: 'Pill' },
    { value: 'glass', name: 'Glass' },
  ]

  const cardStyles = [
    { value: 'floating', name: 'Floating Card', description: 'Card with shadow and padding' },
    { value: 'plain', name: 'Plain Style', description: 'Content directly on background' },
  ]

  const fontFamilies = [
    { value: 'inter', name: 'Inter' },
    { value: 'roboto', name: 'Roboto' },
    { value: 'poppins', name: 'Poppins' },
  ]

  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'tiktok', name: 'TikTok', icon: Music },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
    { id: 'website', name: 'Website', icon: Globe },
  ]

  const updateSocialLink = (platform: string, url: string, display: boolean) => {
    const currentSocial = design.socialLinks || []
    const existingIndex = currentSocial.findIndex(link => link.platform === platform)
    
    let updatedSocial: SocialLink[]
    
    if (existingIndex >= 0) {
      updatedSocial = [...currentSocial]
      updatedSocial[existingIndex] = { platform: platform as SocialLink['platform'], url, display }
    } else {
      updatedSocial = [...currentSocial, { platform: platform as SocialLink['platform'], url, display }]
    }
    
    onChange({ socialLinks: updatedSocial })
  }

  const getSocialLink = (platform: string) => {
    return design.socialLinks?.find(link => link.platform === platform) || { url: '', display: false }
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={design.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={design.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={design.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Type
              </label>
              <select
                value={design.backgroundType}
                onChange={(e) => onChange({ backgroundType: e.target.value as DesignSettings['backgroundType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                {backgroundTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {design.backgroundType === 'solid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  value={design.backgroundValue || design.primaryColor}
                  onChange={(e) => onChange({ backgroundValue: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            )}

            {design.backgroundType === 'gradient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gradient CSS
                </label>
                <textarea
                  value={design.backgroundValue || ''}
                  onChange={(e) => onChange({ backgroundValue: e.target.value })}
                  placeholder="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={2}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {buttonStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => onChange({ buttonStyle: style.value as DesignSettings['buttonStyle'] })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      design.buttonStyle === style.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={design.fontFamily}
                onChange={(e) => onChange({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Style
              </label>
              <div className="space-y-2">
                {cardStyles.map((style) => (
                  <div
                    key={style.value}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      design.cardStyle === style.value || (style.value === 'floating' && !design.cardStyle)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => onChange({ cardStyle: style.value as DesignSettings['cardStyle'] })}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`font-medium ${
                          design.cardStyle === style.value || (style.value === 'floating' && !design.cardStyle)
                            ? 'text-indigo-700'
                            : 'text-gray-900'
                        }`}>
                          {style.name}
                        </span>
                        <p className={`text-xs mt-1 ${
                          design.cardStyle === style.value || (style.value === 'floating' && !design.cardStyle)
                            ? 'text-indigo-600'
                            : 'text-gray-500'
                        }`}>
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={design.avatarUrl || ''}
                onChange={(e) => onChange({ avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChange({ avatarStyle: 'circle' })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    (design.avatarStyle || 'circle') === 'circle'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Circle
                  <p className="text-xs mt-1 opacity-75">Round avatar with shadow</p>
                </button>
                <button
                  onClick={() => onChange({ avatarStyle: 'banner' })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    design.avatarStyle === 'banner'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Banner
                  <p className="text-xs mt-1 opacity-75">Full-width image banner</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={design.description || ''}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Tell visitors about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Add your social media links to appear on your QR page.
            </p>
            {socialPlatforms.map((platform) => {
              const socialLink = getSocialLink(platform.id)
              return (
                <div key={platform.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                    <platform.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {platform.name}
                    </label>
                    <input
                      type="url"
                      value={socialLink.url}
                      onChange={(e) => updateSocialLink(platform.id, e.target.value, socialLink.display)}
                      placeholder={`https://${platform.id}.com/username`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={socialLink.display}
                      onChange={(e) => updateSocialLink(platform.id, socialLink.url, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Show</span>
                  </label>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {/* Title Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Title Settings</h4>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTitle"
                  checked={design.showTitle ?? true}
                  onChange={(e) => onChange({ showTitle: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showTitle" className="text-sm font-medium text-gray-700">
                  Show page title
                </label>
              </div>
              
              {design.showTitle !== false && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Title (optional)
                  </label>
                  <input
                    type="text"
                    value={design.customTitle || ''}
                    onChange={(e) => onChange({ customTitle: e.target.value })}
                    placeholder="Leave empty to use QR code name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If empty, will display the QR code name instead
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom CSS
              </label>
              <textarea
                value={design.customCss || ''}
                onChange={(e) => onChange({ customCss: e.target.value })}
                placeholder={`/* Custom CSS for your QR page */\n.custom-button {\n  border-radius: 20px;\n}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add custom CSS to further customize your QR page appearance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}