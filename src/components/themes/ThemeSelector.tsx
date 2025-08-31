'use client'

import { useState } from 'react'
import { themeTemplates, ThemeTemplate } from '@/lib/themes/templates'
import { useCustomThemes, useDeleteCustomTheme } from '@/hooks/use-custom-themes'
// Design-related imports

interface ThemeSelectorProps {
  currentTheme: string
  onThemeSelect: (themeId: string, theme: ThemeTemplate) => void
  className?: string
}

export function ThemeSelector({
  currentTheme,
  onThemeSelect,
  className = '',
}: ThemeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const { data: customThemes = [], isLoading: isLoadingCustomThemes } = useCustomThemes()
  const deleteCustomThemeMutation = useDeleteCustomTheme()
  
  const categories = [
    { id: 'all', name: 'All Themes' },
    { id: 'custom', name: 'My Custom Themes' },
    { id: 'modern', name: 'Modern' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' },
    { id: 'social', name: 'Social' },
    { id: 'dark', name: 'Dark' },
  ]

  const getFilteredThemes = (): ThemeTemplate[] => {
    if (selectedCategory === 'all') {
      return [...themeTemplates, ...customThemes]
    } else if (selectedCategory === 'custom') {
      return customThemes
    } else {
      return themeTemplates.filter(theme => theme.category === selectedCategory)
    }
  }

  const filteredThemes = getFilteredThemes()

  const getPreviewStyle = (theme: ThemeTemplate) => {
    const { styles } = theme
    let backgroundStyle = {}
    
    switch (styles.backgroundType) {
      case 'solid':
        backgroundStyle = { backgroundColor: styles.backgroundValue }
        break
      case 'gradient':
        backgroundStyle = { background: styles.backgroundValue }
        break
      default:
        backgroundStyle = { background: styles.backgroundValue }
    }
    
    return backgroundStyle
  }

  const getButtonPreviewStyle = (theme: ThemeTemplate) => {
    const { styles } = theme
    return {
      backgroundColor: 'rgba(255,255,255,0.9)',
      color: styles.primaryColor,
      borderRadius: styles.buttonStyle === 'pill' ? '9999px' : 
                   styles.buttonStyle === 'square' ? '0px' : '8px'
    }
  }

  const handleDeleteCustomTheme = async (themeId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent theme selection when clicking delete
    
    if (confirm('Are you sure you want to delete this custom theme? This action cannot be undone.')) {
      try {
        await deleteCustomThemeMutation.mutateAsync(themeId)
      } catch (error) {
        console.error('Failed to delete custom theme:', error)
        alert('Failed to delete custom theme. Please try again.')
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Loading state for custom themes */}
      {selectedCategory === 'custom' && isLoadingCustomThemes && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading your custom themes...</p>
        </div>
      )}

      {/* Empty state for custom themes */}
      {selectedCategory === 'custom' && !isLoadingCustomThemes && customThemes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No custom themes yet</p>
          <p className="text-sm text-gray-400">Customize any theme and click &quot;Save as Theme&quot; to create your first custom theme.</p>
        </div>
      )}

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
              currentTheme === theme.id
                ? 'ring-2 ring-indigo-500 shadow-lg scale-105'
                : 'hover:shadow-md hover:scale-102'
            }`}
            onClick={() => onThemeSelect(theme.id, theme)}
          >
            {/* Theme Preview */}
            <div 
              className="h-32 p-4 flex flex-col justify-between"
              style={getPreviewStyle(theme)}
            >
              {/* Mini avatar and title */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/90"></div>
                <div className="h-2 w-16 bg-white/90 rounded"></div>
              </div>
              
              {/* Mini buttons */}
              <div className="space-y-1">
                <div 
                  className="h-2 rounded text-xs flex items-center justify-center"
                  style={getButtonPreviewStyle(theme)}
                ></div>
                <div 
                  className="h-2 rounded text-xs flex items-center justify-center"
                  style={getButtonPreviewStyle(theme)}
                ></div>
              </div>
            </div>
            
            {/* Theme Info */}
            <div className="bg-white p-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{theme.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{theme.category}</p>
                </div>
                {theme.isPremium && (
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-medium">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{theme.description}</p>
            </div>

            {/* Selected indicator */}
            {currentTheme === theme.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Delete button for custom themes */}
            {theme.category === 'custom' && (
              <div className="absolute top-2 left-2">
                <button
                  onClick={(e) => handleDeleteCustomTheme(theme.id, e)}
                  disabled={deleteCustomThemeMutation.isPending}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-colors"
                  title="Delete custom theme"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}