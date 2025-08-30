import { getLeadsByStatus, createLead, updateLeadStatus } from '@/app/actions/leads'
import { LeadStatus } from '@prisma/client'
import LeadCard from '@/components/LeadCard'
import CreateLeadForm from '@/components/CreateLeadForm'

const statusColumns = [
  { key: LeadStatus.NEW, title: 'חדש', color: 'bg-blue-50' },
  { key: LeadStatus.CONTACTED, title: 'נוצר קשר', color: 'bg-yellow-50' },
  { key: LeadStatus.QUOTED, title: 'הוצע מחיר', color: 'bg-purple-50' },
  { key: LeadStatus.CONTRACT, title: 'חוזה', color: 'bg-orange-50' },
  { key: LeadStatus.DEPOSIT, title: 'מקדמה', color: 'bg-indigo-50' },
  { key: LeadStatus.BALANCE, title: 'יתרה', color: 'bg-pink-50' },
  { key: LeadStatus.WON, title: 'נצחנו', color: 'bg-green-50' },
  { key: LeadStatus.LOST, title: 'איבדנו', color: 'bg-red-50' }
]

export default async function LeadsPage() {
  const leadsByStatus = await getLeadsByStatus()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לידים</h1>
          <p className="text-gray-600 mt-2">ניהול לידים ומעקב אחר סטטוס</p>
        </div>
        <CreateLeadForm />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {statusColumns.map(column => (
          <div key={column.key} className={`kanban-column ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm">
                {leadsByStatus[column.key]?.length || 0}
              </span>
            </div>
            
            <div className="space-y-3">
              {leadsByStatus[column.key]?.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onStatusUpdate={updateLeadStatus}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}