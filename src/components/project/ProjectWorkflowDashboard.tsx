'use client'

import { useState, useEffect } from 'react'
import { QrCode, TrendingUp, Eye, Edit3, ExternalLink, MoreHorizontal, Plus } from 'lucide-react'

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

interface WorkflowStage {
  id: string
  name: string
  description: string
  color: string
  bgColor: string
  icon: React.ReactNode
  qrCodes: QRCodeData[]
}

interface ProjectWorkflowDashboardProps {
  qrCodes: QRCodeData[]
  onQRCodeSelect: (qrCode: QRCodeData) => void
  onCreateQRCode: () => void
  className?: string
}

export default function ProjectWorkflowDashboard({
  qrCodes,
  onQRCodeSelect,
  onCreateQRCode,
  className = ''
}: ProjectWorkflowDashboardProps) {
  const [stages, setStages] = useState<WorkflowStage[]>([])

  // Organize QR codes into workflow stages
  useEffect(() => {
    const planningQRs = qrCodes.filter(qr => 
      !qr.isActive && qr._count.scans === 0
    )

    const designQRs = qrCodes.filter(qr => 
      qr.isActive && qr._count.scans === 0
    )

    const activeQRs = qrCodes.filter(qr => 
      qr.isActive && qr._count.scans > 0 && qr._count.scans < 100
    )

    const analyticsQRs = qrCodes.filter(qr => 
      qr.isActive && qr._count.scans >= 100
    )

    const workflowStages: WorkflowStage[] = [
      {
        id: 'planning',
        name: 'Planning',
        description: 'New QR codes being configured',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50 border-slate-200',
        icon: <Edit3 className="w-5 h-5" />,
        qrCodes: planningQRs
      },
      {
        id: 'design',
        name: 'Ready',
        description: 'QR codes ready for deployment',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <QrCode className="w-5 h-5" />,
        qrCodes: designQRs
      },
      {
        id: 'active',
        name: 'Active',
        description: 'Live QR codes receiving scans',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        icon: <Eye className="w-5 h-5" />,
        qrCodes: activeQRs
      },
      {
        id: 'analytics',
        name: 'High Performance',
        description: 'QR codes with significant traffic',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: <TrendingUp className="w-5 h-5" />,
        qrCodes: analyticsQRs
      }
    ]

    setStages(workflowStages)
  }, [qrCodes])

  const QRCodeCard = ({ qrCode }: { qrCode: QRCodeData }) => (
    <div 
      onClick={() => onQRCodeSelect(qrCode)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {qrCode.title}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-500">/{qrCode.shortCode}</span>
            {qrCode.isActive ? (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                Active
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                Draft
              </span>
            )}
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* QR Preview */}
      <div className="flex items-center space-x-3 mb-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-mono"
          style={{ 
            backgroundColor: qrCode.fgColor === '#000000' ? '#f3f4f6' : qrCode.fgColor + '20',
            borderColor: qrCode.fgColor,
            color: qrCode.fgColor
          }}
        >
          QR
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600">
            {qrCode.redirectType === 'url' ? 'Direct Link' : `${qrCode.links?.length || 0} Links`}
          </div>
          {qrCode.redirectUrl && qrCode.redirectType === 'url' && (
            <div className="text-xs text-gray-500 truncate">
              {qrCode.redirectUrl}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span>{qrCode._count.scans.toLocaleString()}</span>
          </div>
          {qrCode.logoUrl && (
            <div className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-indigo-500"></div>
            </div>
          )}
        </div>
        <button className="text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-all">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const StageConnector = () => (
    <div className="flex-shrink-0 flex items-center justify-center w-16 h-1">
      <div className="w-full h-px bg-gradient-to-r from-gray-300 to-gray-400 relative">
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-gray-400 rounded-full border-2 border-white shadow-sm"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`${className}`}>
      {/* Workflow Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Workflow</h2>
        <p className="text-gray-600">Track your QR codes through their lifecycle</p>
      </div>

      {/* Workflow Stages */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage, stageIndex) => (
          <div key={stage.id} className="flex items-start">
            {/* Stage Column */}
            <div className="flex-shrink-0 w-80">
              {/* Stage Header */}
              <div className={`${stage.bgColor} ${stage.color} border rounded-t-xl p-4`}>
                <div className="flex items-center space-x-3 mb-2">
                  {stage.icon}
                  <h3 className="font-semibold text-lg">{stage.name}</h3>
                  <span className="px-2 py-1 bg-white bg-opacity-70 text-xs rounded-full font-medium">
                    {stage.qrCodes.length}
                  </span>
                </div>
                <p className="text-sm opacity-80">{stage.description}</p>
              </div>

              {/* QR Cards Container */}
              <div className="bg-gray-50 border border-t-0 rounded-b-xl min-h-96 p-4 space-y-3">
                {stage.qrCodes.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full ${stage.bgColor} ${stage.color} flex items-center justify-center mx-auto mb-3`}>
                        {stage.icon}
                      </div>
                      <p className="text-gray-500 text-sm">No QR codes in this stage</p>
                      {stage.id === 'planning' && (
                        <button
                          onClick={onCreateQRCode}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create QR Code</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  stage.qrCodes.map((qrCode) => (
                    <QRCodeCard 
                      key={qrCode.id} 
                      qrCode={qrCode}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Stage Connector */}
            {stageIndex < stages.length - 1 && (
              <StageConnector />
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {qrCodes.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <QrCode className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active QR Codes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {qrCodes.filter(qr => qr.isActive).length}
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
                <p className="text-sm text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {qrCodes.reduce((sum, qr) => sum + qr._count.scans, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Scans per QR</p>
                <p className="text-2xl font-bold text-gray-900">
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
    </div>
  )
}