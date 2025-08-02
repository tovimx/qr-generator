'use client'

import { useState, useEffect } from 'react'
import { Link } from '@prisma/client'

interface LinkEditorProps {
  links: Link[]
  onSave: (links: Omit<Link, 'id' | 'qrCodeId' | 'createdAt' | 'updatedAt'>[]) => void
  loading: boolean
}

export default function LinkEditor({ links: initialLinks, onSave, loading }: LinkEditorProps) {
  const [links, setLinks] = useState<Omit<Link, 'id' | 'qrCodeId' | 'createdAt' | 'updatedAt'>[]>([])

  useEffect(() => {
    const formattedLinks = initialLinks.map(link => ({
      title: link.title,
      url: link.url,
      position: link.position,
      isActive: link.isActive,
    }))
    
    // Ensure we always have 5 link slots
    while (formattedLinks.length < 5) {
      formattedLinks.push({
        title: '',
        url: '',
        position: formattedLinks.length,
        isActive: true,
      })
    }
    
    setLinks(formattedLinks)
  }, [initialLinks])

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const handleSave = () => {
    // Filter out empty links before saving
    const validLinks = links.filter(link => link.title && link.url)
    onSave(validLinks)
  }

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Link title"
              value={link.title}
              onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
              className="block w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              className="block w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      ))}
      
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Links'}
      </button>
    </div>
  )
}