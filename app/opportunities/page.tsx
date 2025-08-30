import { getOpportunities } from '@/app/actions/opportunities'
import { formatCurrency } from '@/lib/currency'
import { formatDateHe } from '@/lib/dayjs'

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">הזדמנויות</h1>
          <p className="text-gray-600 mt-2">ניהול הזדמנויות והצעות מחיר</p>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="card">
        {opportunities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>לקוח</th>
                  <th>חבילה</th>
                  <th>מצב עסקה</th>
                  <th>מחיר</th>
                  <th>שלב</th>
                  <th>תוקף</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id}>
                    <td>
                      <div>
                        <div className="font-medium">{opportunity.lead.clientName}</div>
                        <div className="text-sm text-gray-500">
                          {opportunity.lead.eventType && `${opportunity.lead.eventType} • `}
                          {opportunity.lead.location}
                        </div>
                      </div>
                    </td>
                    <td>{opportunity.packageName || '-'}</td>
                    <td>
                      <span className={`status-badge ${getDealModeClass(opportunity.dealMode)}`}>
                        {getDealModeText(opportunity.dealMode)}
                      </span>
                    </td>
                    <td className="font-medium">{formatCurrency(opportunity.price)}</td>
                    <td>
                      <span className={`status-badge ${getStageClass(opportunity.stage)}`}>
                        {getStageText(opportunity.stage)}
                      </span>
                    </td>
                    <td>
                      {opportunity.validUntil ? formatDateHe(opportunity.validUntil) : '-'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {opportunity.stage === 'QUOTED' && (
                          <button className="text-sm btn btn-success">
                            נצחון
                          </button>
                        )}
                        <button className="text-sm btn btn-secondary">
                          עריכה
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין הזדמנויות</h3>
            <p className="text-gray-500">צור הזדמנות חדשה מתוך הלידים</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">סה״כ הזדמנויות</p>
              <p className="text-2xl font-semibold text-gray-900">{opportunities.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">ערך פוטנציאלי</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.price, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⏳</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">ממתינות להחלטה</p>
              <p className="text-2xl font-semibold text-gray-900">
                {opportunities.filter(opp => opp.stage === 'QUOTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getDealModeClass(mode: string) {
  switch (mode) {
    case 'IN_HOUSE': return 'bg-blue-100 text-blue-800'
    case 'MANAGED_CONTRACTOR': return 'bg-purple-100 text-purple-800'
    case 'REFERRAL_ONLY': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getDealModeText(mode: string) {
  switch (mode) {
    case 'IN_HOUSE': return 'פנימי'
    case 'MANAGED_CONTRACTOR': return 'קבלן מנוהל'
    case 'REFERRAL_ONLY': return 'הפניה בלבד'
    default: return mode
  }
}

function getStageClass(stage: string) {
  switch (stage) {
    case 'QUOTED': return 'status-quoted'
    case 'WON': return 'status-won'
    case 'LOST': return 'status-lost'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStageText(stage: string) {
  switch (stage) {
    case 'QUOTED': return 'הוצע מחיר'
    case 'WON': return 'נצחנו'
    case 'LOST': return 'איבדנו'
    default: return stage
  }
}