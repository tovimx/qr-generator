'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, FolderOpen, QrCode, TrendingUp, Clock, Edit3, Check, X } from 'lucide-react'
import { ProjectWithStats } from '@/types/qr-code'

interface ProjectSelectorProps {
  selectedProject: ProjectWithStats | null
  projects: ProjectWithStats[]
  onProjectSelect: (project: ProjectWithStats) => void
  onProjectCreate: (name: string) => Promise<void>
  className?: string
}

export default function ProjectSelector({
  selectedProject,
  projects,
  onProjectSelect,
  onProjectCreate,
  className = ''
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false)
      setIsCreating(false)
      setIsEditingName(false)
      setEditingProjectId(null)
    }

    if (isOpen || isCreating || isEditingName) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, isCreating, isEditingName])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newProjectName.trim()) {
      await onProjectCreate(newProjectName.trim())
      setNewProjectName('')
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  const formatLastActivity = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const getProjectStatus = (project: ProjectWithStats) => {
    if (project.qrCodeCount === 0) return { text: 'Empty', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    if (project.activeQRCount === 0) return { text: 'Inactive', color: 'text-amber-600', bgColor: 'bg-amber-100' }
    return { text: 'Active', color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
  }

  return (
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Main Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">
              {selectedProject?.name || 'Select Project'}
            </div>
            {selectedProject && (
              <div className="text-xs text-gray-500 flex items-center space-x-4">
                <span className="flex items-center">
                  <QrCode className="w-3 h-3 mr-1" />
                  {selectedProject.qrCodeCount} QRs
                </span>
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {selectedProject.totalScans.toLocaleString()} scans
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Switch Project</h3>
            <p className="text-xs text-gray-600 mt-1">Manage your QR code projects</p>
          </div>

          {/* Projects List */}
          <div className="max-h-80 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No projects yet</p>
                <p className="text-gray-400 text-xs">Create your first project to get started</p>
              </div>
            ) : (
              projects.map((project) => {
                const status = getProjectStatus(project)
                const isEditing = editingProjectId === project.id

                return (
                  <div
                    key={project.id}
                    className={`px-4 py-3 hover:bg-gray-50 border-l-4 transition-colors ${
                      selectedProject?.id === project.id 
                        ? 'border-l-indigo-500 bg-indigo-50' 
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          onProjectSelect(project)
                          setIsOpen(false)
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${status.bgColor}`}>
                              <div className={`w-full h-full rounded-full ${status.color.replace('text-', 'bg-')}`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  // Handle edit submission here
                                  setEditingProjectId(null)
                                }}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                />
                                <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-100 rounded">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditingProjectId(null)}
                                  className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 truncate">
                                    {project.name}
                                  </span>
                                  {project.isDefault && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <QrCode className="w-3 h-3 mr-1" />
                                    {project.qrCodeCount}
                                  </span>
                                  <span className="flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {project.totalScans.toLocaleString()}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatLastActivity(project.lastActivity)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${status.bgColor} ${status.color}`}>
                                    {status.text}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!isEditing && !project.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProjectId(project.id)
                            setEditName(project.name)
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Create New Project */}
          <div className="border-t border-gray-200 bg-gray-50">
            {isCreating ? (
              <form onSubmit={handleCreateProject} className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                    maxLength={50}
                  />
                  <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsCreating(true)
                }}
                className="w-full px-4 py-3 flex items-center space-x-3 text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create New Project</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}