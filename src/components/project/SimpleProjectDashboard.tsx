'use client'

import React, { useState, useEffect } from 'react'
import { User } from '@prisma/client'
import { Plus, Search, Grid3X3, List, QrCode, Eye, TrendingUp, MoreHorizontal, ExternalLink, Trash2, Edit, Settings } from 'lucide-react'
import ProjectSelector from './ProjectSelector'
import QRCodeManager from '../dashboard/QRCodeManager'
import DomainManager from '../dashboard/DomainManager'
import { QRCodeData, ProjectWithStats } from '@/types/qr-code'
import { useProjects, useCreateProject } from '@/hooks/use-projects'
import { useQRCodes, useCreateQRCode, useDeleteQRCode, useUpdateQRCode } from '@/hooks/use-qr-codes'

// Using TanStack Query for state management

interface SimpleProjectDashboardProps {
  user: User
  initialProjects: ProjectWithStats[]
  initialQRCodes: QRCodeData[]
}

export default function SimpleProjectDashboard({ 
  user, 
  initialProjects, 
  initialQRCodes 
}: SimpleProjectDashboardProps) {
  // TanStack Query hooks
  const { data: projects = [], isLoading: projectsLoading } = useProjects(initialProjects)
  const createProjectMutation = useCreateProject()
  const { mutateAsync: createProjectAsync, isPending: createProjectPending } = createProjectMutation
  
  // Local state
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(
    initialProjects.find(p => p.isDefault) || initialProjects[0] || null
  )
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // QR Codes query for selected project
  const { 
    data: qrCodes = [], 
    isLoading: qrCodesLoading
  } = useQRCodes(selectedProject?.id, selectedProject?.id === initialProjects.find(p => p.isDefault)?.id ? initialQRCodes : undefined)
  
  const createQRCodeMutation = useCreateQRCode()
  const { mutateAsync: createQRCodeAsync, isPending: createQRCodePending } = createQRCodeMutation
  const deleteQRCodeMutation = useDeleteQRCode()
  const { mutateAsync: deleteQRCodeAsync, isPending: deleteQRCodePending } = deleteQRCodeMutation
  const updateQRCodeMutation = useUpdateQRCode()
  const { mutateAsync: updateQRCodeAsync, isPending: updateQRCodePending } = updateQRCodeMutation
  
  const isLoading = projectsLoading || qrCodesLoading || createProjectPending || createQRCodePending || deleteQRCodePending || updateQRCodePending
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const [editQRNameOpen, setEditQRNameOpen] = useState<string | null>(null)
  const [newQRName, setNewQRName] = useState('')
  const [createQRModalOpen, setCreateQRModalOpen] = useState(false)
  const [createQRNameInput, setCreateQRNameInput] = useState('')
  const [activeTab, setActiveTab] = useState<'qr-codes' | 'domains'>('qr-codes')

  // Update selected project when projects change
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      const defaultProject = projects.find(p => p.isDefault) || projects[0]
      setSelectedProject(defaultProject ?? null)
    }
  }, [projects, selectedProject])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null)
    }

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
    return undefined
  }, [dropdownOpen])

  // These functions are no longer needed as TanStack Query handles data fetching
  // Data is automatically refetched and cached

  const handleProjectSelect = (project: ProjectWithStats) => {
    setSelectedProject(project)
    setSelectedQRCode(null)
    setSearchQuery('')
  }

  const handleProjectCreate = async (name: string) => {
    try {
      const newProject = await createProjectAsync(name)
      setSelectedProject(newProject)
    } catch (error) {
      console.error('Error creating project:', error)
      alert(error instanceof Error ? error.message : 'Failed to create project')
    }
  }

  const handleCreateQRCode = () => {
    setCreateQRModalOpen(true)
    setCreateQRNameInput('')
  }

  const handleCreateQRCodeConfirm = async () => {
    if (!selectedProject) return

    const qrTitle = createQRNameInput.trim() || `QR Code ${qrCodes.length + 1}`

    try {
      const newQRCode = await createQRCodeAsync({
        title: qrTitle,
        projectId: selectedProject.id,
      })
      setSelectedQRCode(newQRCode)
      setCreateQRModalOpen(false)
      setCreateQRNameInput('')
    } catch (error) {
      console.error('Error creating QR code:', error)
      alert(error instanceof Error ? error.message : 'Failed to create QR code')
    }
  }

  const handleDeleteQRCode = async (qrCodeId: string) => {
    try {
      await deleteQRCodeAsync(qrCodeId)
      
      // If we deleted the selected QR code, clear selection
      if (selectedQRCode?.id === qrCodeId) {
        setSelectedQRCode(null)
      }
      
      // Close confirmation dialog
      setDeleteConfirmOpen(null)
      setDropdownOpen(null)
    } catch (error) {
      console.error('Error deleting QR code:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete QR code')
    }
  }

  const handleUpdateQRName = async (qrCodeId: string) => {
    if (!newQRName.trim()) return
    
    try {
      const updatedQRCode = await updateQRCodeAsync({
        id: qrCodeId,
        updates: { title: newQRName.trim() }
      })
      
      // Update selected QR if it's the one being edited
      if (selectedQRCode?.id === qrCodeId) {
        setSelectedQRCode({ ...selectedQRCode, title: updatedQRCode.title })
      }
      
      setEditQRNameOpen(null)
      setNewQRName('')
      setDropdownOpen(null)
    } catch (error) {
      console.error('Error updating QR code name:', error)
      alert(error instanceof Error ? error.message : 'Failed to update QR code name')
    }
  }


  const filteredQRCodes = qrCodes.filter(qr =>
    qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qr.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const QRCodeCard = ({ qrCode, compact = false }: { qrCode: QRCodeData, compact?: boolean }) => (
    <div 
      onClick={() => setSelectedQRCode(qrCode)}
      className={`group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all duration-200 ${compact ? 'p-4' : 'p-6'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {qrCode.title}
          </h3>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-sm text-gray-500 font-mono">/{qrCode.shortCode}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              qrCode.isActive 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {qrCode.isActive ? 'Active' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen(dropdownOpen === qrCode.id ? null : qrCode.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {dropdownOpen === qrCode.id && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDropdownOpen(null)
                  setEditQRNameOpen(qrCode.id)
                  setNewQRName(qrCode.title)
                }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit QR Name</span>
              </button>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDropdownOpen(null)
                  setDeleteConfirmOpen(qrCode.id)
                }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Preview */}
      <div className="flex items-center space-x-4 mb-4">
        <div 
          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
          style={{ 
            backgroundColor: qrCode.fgColor === '#000000' ? '#f8fafc' : qrCode.fgColor + '15',
            borderColor: qrCode.fgColor + '30',
            color: qrCode.fgColor
          }}
        >
          QR
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 mb-1">
            {qrCode.redirectType === 'url' ? 'Direct redirect' : `${qrCode.links?.length || 0} links`}
          </div>
          {qrCode.redirectUrl && qrCode.redirectType === 'url' && (
            <div className="text-xs text-gray-500 truncate font-mono">
              {qrCode.redirectUrl}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{qrCode._count.scans.toLocaleString()}</span>
          </div>
          {qrCode.logoUrl && (
            <div className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-indigo-500"></div>
            </div>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 transition-all">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Create your first project</h2>
          <p className="text-gray-600 mb-6">Get started by creating a project to organize your QR codes</p>
          <button
            onClick={() => handleProjectCreate('My First Project')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    )
  }

  if (selectedQRCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setSelectedQRCode(null)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to {selectedProject.name}</span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Detail */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{selectedQRCode.title}</h1>
                  <p className="text-gray-600 mt-1">Project: {selectedProject.name}</p>
                </div>
                <button
                  onClick={() => setSelectedQRCode(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <QRCodeManager qrCode={selectedQRCode} />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">QR Generator</h1>
              </div>
            </div>

            {/* Center - Project Selector */}
            <div className="flex-1 max-w-md mx-8">
              <ProjectSelector
                selectedProject={selectedProject}
                projects={projects}
                onProjectSelect={handleProjectSelect}
                onProjectCreate={handleProjectCreate}
              />
            </div>

            {/* Right */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{selectedProject.name}</h2>
              {activeTab === 'qr-codes' && (
                <p className="text-gray-600 mt-1">
                  {qrCodes.length} QR codes • {qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0).toLocaleString()} total scans
                </p>
              )}
              {activeTab === 'domains' && (
                <p className="text-gray-600 mt-1">
                  Manage custom domains for your QR codes
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {activeTab === 'qr-codes' && (
                <button
                  onClick={handleCreateQRCode}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New QR Code</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('qr-codes')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'qr-codes'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Codes</span>
            </button>
            <button
              onClick={() => setActiveTab('domains')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'domains'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Domains</span>
            </button>
          </div>
        </div>

        {/* QR Codes Controls */}
          {activeTab === 'qr-codes' && (
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search QR codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>
          )}

        {/* QR Codes Content */}
        {activeTab === 'qr-codes' && (
          <React.Fragment>
            {/* QR Codes Grid/List */}
        {filteredQRCodes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes found</h3>
                <p className="text-gray-600">Try adjusting your search query</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes yet</h3>
                <p className="text-gray-600 mb-6">Create your first QR code to get started</p>
                <button
                  onClick={handleCreateQRCode}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Create QR Code
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredQRCodes.map((qrCode) => (
              <QRCodeCard 
                key={qrCode.id} 
                qrCode={qrCode} 
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {qrCodes.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <QrCode className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total QR Codes</p>
                  <p className="text-2xl font-semibold text-gray-900">{qrCodes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Scans</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Scans</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {qrCodes.length > 0 ? 
                      Math.round(qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0) / qrCodes.length) : 
                      0
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
          </React.Fragment>
        )}

        {/* Domains Content */}
        {activeTab === 'domains' && (
          <div className="mt-8">
            <DomainManager />
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete QR Code</h3>
                <p className="text-sm text-gray-600">
                  {qrCodes.find(qr => qr.id === deleteConfirmOpen)?.title}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this QR code? This action cannot be undone, but your scan analytics will be preserved.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQRCode(deleteConfirmOpen)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isLoading ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create QR Code Modal */}
      {createQRModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Plus className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create New QR Code</h3>
                <p className="text-sm text-gray-600">Choose a name for your QR code</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Name
              </label>
              <input
                type="text"
                value={createQRNameInput}
                onChange={(e) => setCreateQRNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateQRCodeConfirm()
                  if (e.key === 'Escape') setCreateQRModalOpen(false)
                }}
                placeholder={`QR Code ${qrCodes.length + 1}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default name: &quot;QR Code {qrCodes.length + 1}&quot;
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setCreateQRModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQRCodeConfirm}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isLoading ? 'Creating...' : 'Create QR Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit QR Name Modal */}
      {editQRNameOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit QR Code Name</h3>
                <p className="text-sm text-gray-600">
                  {qrCodes.find(qr => qr.id === editQRNameOpen)?.title}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New QR Code Name
              </label>
              <input
                type="text"
                value={newQRName}
                onChange={(e) => setNewQRName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateQRName(editQRNameOpen)
                  if (e.key === 'Escape') {
                    setEditQRNameOpen(null)
                    setNewQRName('')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setEditQRNameOpen(null)
                  setNewQRName('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateQRName(editQRNameOpen)}
                disabled={isLoading || !newQRName.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>{isLoading ? 'Updating...' : 'Update Name'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}