import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/currency'
import { getPartnerHoldings } from '@/lib/treasury'

async function getReportsData() {
  try {
    const [
      totalEvents,
      totalRevenue,
      totalExpenses,
      totalMusicians,
      totalVendors,
      partnerHoldings,
      recentSettlements
    ] = await Promise.all([
      prisma.event.count(),
      prisma.revenueItem.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.musician.count(),
      prisma.vendor.count(),
      getPartnerHoldings(),
      prisma.settlement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: { title: true, date: true, clientName: true }
          }
        }
      })
    ])

    const grossRevenue = totalRevenue._sum.amount || 0
    const directCosts = totalExpenses._sum.amount || 0
    const netRevenue = grossRevenue - directCosts

    return {
      totalEvents,
      grossRevenue,
      directCosts,
      netRevenue,
      totalMusicians,
      totalVendors,
      partnerHoldings,
      recentSettlements
    }
  } catch (error) {
    console.error('Error fetching reports data:', error)
    return {
      totalEvents: 0,
      grossRevenue: 0,
      directCosts: 0,
      netRevenue: 0,
      totalMusicians: 0,
      totalVendors: 0,
      partnerHoldings: 0,
      recentSettlements: []
    }
  }
}

export default async function ReportsPage() {
  const data = await getReportsData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">דוחות</h1>
        <p className="text-gray-600 mt-2">סקירה כללית וניתוח ביצועים</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎵</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">סה״כ אירועים</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalEvents}</p>
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
              <p className="text-sm text-gray-500">הכנסות ברוטו</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.grossRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💸</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">הוצאות ישירות</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.directCosts)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">רווח נטו</p>
              <p className={`text-2xl font-semibold ${data.netRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.netRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👨‍🎤</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">נגנים במערכת</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalMusicians}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏢</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">ספקים פעילים</p>
              <p className="text-2xl font-semibold text-gray-900">{data.totalVendors}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏦</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">יתרת שותפים</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.partnerHoldings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Analysis */}
      {data.grossRevenue > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ניתוח רווחיות</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {((data.grossRevenue / data.grossRevenue) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">הכנסות ברוטו</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {((data.directCosts / data.grossRevenue) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">הוצאות ישירות</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${data.netRevenue >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {((data.netRevenue / data.grossRevenue) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">מרווח רווח</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Settlements */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">סיכומים אחרונים</h2>
        
        {data.recentSettlements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>אירוע</th>
                  <th>לקוח</th>
                  <th>תאריך</th>
                  <th>הכנסות ברוטו</th>
                  <th>הוצאות</th>
                  <th>רווח נטו</th>
                  <th>שותף א׳</th>
                  <th>שותף ב׳</th>
                  <th>קופה</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSettlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <td className="font-medium">{settlement.event.title}</td>
                    <td>{settlement.event.clientName}</td>
                    <td>{new Date(settlement.event.date).toLocaleDateString('he-IL')}</td>
                    <td className="text-green-600 font-medium">{formatCurrency(settlement.grossRevenue)}</td>
                    <td className="text-red-600">{formatCurrency(settlement.directCosts)}</td>
                    <td className={`font-medium ${settlement.netRevenue >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                      {formatCurrency(settlement.netRevenue)}
                    </td>
                    <td className="text-blue-600">{formatCurrency(settlement.partnerADraw)}</td>
                    <td className="text-blue-600">{formatCurrency(settlement.partnerBDraw)}</td>
                    <td className="text-gray-600">{formatCurrency(settlement.businessFundContribution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין סיכומים</h3>
            <p className="text-gray-500">סיכומי אירועים יופיעו כאן לאחר חישוב settlements</p>
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ייצוא נתונים</h2>
        <div className="flex gap-3">
          <button className="btn btn-secondary">
            ייצוא אירועים (CSV)
          </button>
          <button className="btn btn-secondary">
            ייצוא הכנסות (CSV)
          </button>
          <button className="btn btn-secondary">
            ייצוא הוצאות (CSV)
          </button>
          <button className="btn btn-secondary">
            ייצוא settlements (CSV)
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          לביצוע ייצוא מפורט יותר, פנה למנהל המערכת
        </p>
      </div>
    </div>
  )
}