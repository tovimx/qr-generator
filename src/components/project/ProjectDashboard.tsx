'use client'

import { useState, useEffect } from 'react'
import { User } from '@prisma/client'
// import { useRouter } from 'next/navigation'
import ProjectSelector from './ProjectSelector'
import ProjectWorkflowDashboard from './ProjectWorkflowDashboard'
import QRCodeManager from '../dashboard/QRCodeManager'

interface Project {
  id: string
  name: string
  isDefault: boolean
  qrCodeCount: number
  activeQRCount: number
  totalScans: number
  lastActivity: number
}

interface QRCodeData {
  id: string
  title: string
  shortCode: string
  isActive: boolean
  position: number
  redirectType: string
  redirectUrl?: string | null
  logoUrl?: string | null
  logoSize: number
  logoShape: string
  cornerRadius: number
  fgColor: string
  projectId?: string | null
  _count: {
    scans: number
  }
  links: Array<{
    id: string
    title: string
    url: string
    position: number
    isActive: boolean
  }>
  project?: {
    id: string
    name: string
    isDefault: boolean
  } | null
}

interface ProjectDashboardProps {
  user: User
  initialProjects: Project[]
  initialQRCodes: QRCodeData[]
}

export default function ProjectDashboard({ 
  user, 
  initialProjects, 
  initialQRCodes 
}: ProjectDashboardProps) {
  // const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    initialProjects.find(p => p.isDefault) || initialProjects[0] || null
  )
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>(initialQRCodes)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null)
  const [view, setView] = useState<'workflow' | 'qr-detail'>('workflow')
  const [isLoading, setIsLoading] = useState(false)

  // Load QR codes when project changes
  useEffect(() => {
    if (selectedProject) {
      loadQRCodes(selectedProject.id)
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
        
        // Update selected project with fresh data
        if (selectedProject) {
          const updatedProject = data.projects.find((p: Project) => p.id === selectedProject.id)
          if (updatedProject) {
            setSelectedProject(updatedProject)
          }
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadQRCodes = async (projectId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/qr-codes?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setQRCodes(data.qrCodes)
      }
    } catch (error) {
      console.error('Error loading QR codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project)
    setSelectedQRCode(null)
    setView('workflow')
  }

  const handleProjectCreate = async (name: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects([...projects, newProject])
        setSelectedProject(newProject)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    }
  }

  const handleQRCodeSelect = (qrCode: QRCodeData) => {
    setSelectedQRCode(qrCode)
    setView('qr-detail')
  }

  const handleCreateQRCode = async () => {
    if (!selectedProject) return

    try {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `QR Code ${qrCodes.length + 1}`,
          projectId: selectedProject.id,
        }),
      })

      if (response.ok) {
        const newQRCode = await response.json()
        setQRCodes([...qrCodes, newQRCode])
        setSelectedQRCode(newQRCode)
        setView('qr-detail')
        
        // Refresh projects to update counts
        await loadProjects()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create QR code')
      }
    } catch (error) {
      console.error('Error creating QR code:', error)
      alert('Failed to create QR code')
    }
  }

  const handleBackToWorkflow = () => {
    setSelectedQRCode(null)
    setView('workflow')
    // Refresh data
    loadProjects()
    if (selectedProject) {
      loadQRCodes(selectedProject.id)
    }
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Project selector and navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">QR</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">QR Generator</h1>
              </div>
              
              {view === 'qr-detail' && (
                <button
                  onClick={handleBackToWorkflow}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  ← Back to Workflow
                </button>
              )}
            </div>

            {/* Center - Project Selector */}
            <div className="flex-1 max-w-md mx-6">
              <ProjectSelector
                selectedProject={selectedProject}
                projects={projects}
                onProjectSelect={handleProjectSelect}
                onProjectCreate={handleProjectCreate}
              />
            </div>

            {/* Right side - User info */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">Welcome, {user.email}</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {user.email?.[0]?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedProject ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Project Selected</h2>
            <p className="text-gray-600 mb-6">Create or select a project to get started</p>
            <button
              onClick={() => handleProjectCreate('My First Project')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : view === 'workflow' ? (
          <ProjectWorkflowDashboard
            qrCodes={qrCodes}
            onQRCodeSelect={handleQRCodeSelect}
            onCreateQRCode={handleCreateQRCode}
          />
        ) : selectedQRCode ? (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedQRCode.title}</h2>
                  <p className="text-gray-600">
                    Project: {selectedQRCode.project?.name || selectedProject.name}
                  </p>
                </div>
                <button
                  onClick={handleBackToWorkflow}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* @ts-expect-error - Type compatibility will be fixed later */}
              <QRCodeManager qrCode={selectedQRCode} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}