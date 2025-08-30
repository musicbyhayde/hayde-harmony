'use client'

import { useState } from 'react'
import { LeadStatus } from '@prisma/client'
import { formatCurrency } from '@/lib/currency'
import CreateOpportunityModal from './CreateOpportunityModal'

interface Lead {
  id: string
  clientName: string
  phone?: string | null
  email?: string | null
  eventType?: string | null
  date?: Date | null
  location?: string | null
  budget?: number | null
  status: LeadStatus
  notes?: string | null
  opportunities: Array<{
    id: string
    stage: string
    price: number
  }>
}

interface LeadCardProps {
  lead: Lead
  onStatusUpdate: (leadId: string, status: LeadStatus) => Promise<any>
}

export default function LeadCard({ lead, onStatusUpdate }: LeadCardProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [showOpportunityModal, setShowOpportunityModal] = useState(false)

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsMoving(true)
    try {
      await onStatusUpdate(lead.id, newStatus)
    } catch (error) {
      console.error('Error updating lead status:', error)
    } finally {
      setIsMoving(false)
    }
  }

  const canCreateOpportunity = lead.status === LeadStatus.CONTACTED || 
                              lead.status === LeadStatus.QUOTED

  return (
    <>
      <div className={`kanban-card ${isMoving ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 text-sm">{lead.clientName}</h4>
          {lead.budget && (
            <span className="text-xs text-green-600 font-medium">
              {formatCurrency(lead.budget)}
            </span>
          )}
        </div>

        {lead.eventType && (
          <p className="text-xs text-gray-600 mb-1">{lead.eventType}</p>
        )}

        {lead.date && (
          <p className="text-xs text-gray-600 mb-2">
            {new Date(lead.date).toLocaleDateString('he-IL')}
          </p>
        )}

        {lead.location && (
          <p className="text-xs text-gray-500 mb-2">📍 {lead.location}</p>
        )}

        {lead.phone && (
          <p className="text-xs text-gray-500">📞 {lead.phone}</p>
        )}

        {lead.email && (
          <p className="text-xs text-gray-500">✉️ {lead.email}</p>
        )}

        {lead.opportunities.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-purple-600">
              {lead.opportunities.length} הזדמנויות
            </p>
          </div>
        )}

        <div className="mt-3 flex gap-1">
          {lead.status !== LeadStatus.CONTACTED && lead.status !== LeadStatus.WON && lead.status !== LeadStatus.LOST && (
            <button
              onClick={() => handleStatusChange(LeadStatus.CONTACTED)}
              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
              disabled={isMoving}
            >
              יצירת קשר
            </button>
          )}

          {canCreateOpportunity && (
            <button
              onClick={() => setShowOpportunityModal(true)}
              className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
            >
              יצירת הזדמנות
            </button>
          )}

          {lead.status === LeadStatus.QUOTED && (
            <button
              onClick={() => handleStatusChange(LeadStatus.CONTRACT)}
              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
            >
              חוזה
            </button>
          )}
        </div>

        {lead.notes && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">{lead.notes}</p>
          </div>
        )}
      </div>

      {showOpportunityModal && (
        <CreateOpportunityModal
          lead={lead}
          onClose={() => setShowOpportunityModal(false)}
        />
      )}
    </>
  )
}