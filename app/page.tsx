import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/currency'
import { getPartnerHoldings } from '@/lib/treasury'
import { EventStatus } from '@prisma/client'

async function getDashboardStats() {
  try {
    const [events, totalRevenue, totalExpenses, partnerHoldings] = await Promise.all([
      prisma.event.count(),
      prisma.revenueItem.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      getPartnerHoldings()
    ])

    const grossRevenue = totalRevenue._sum.amount || 0
    const totalCosts = totalExpenses._sum.amount || 0
    const netRevenue = grossRevenue - totalCosts

    // Get recent events
    const recentEvents = await prisma.event.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        clientName: true
      }
    })

    return {
      eventsCount: events,
      grossRevenue,
      totalCosts,
      netRevenue,
      partnerHoldings,
      recentEvents
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      eventsCount: 0,
      grossRevenue: 0,
      totalCosts: 0,
      netRevenue: 0,
      partnerHoldings: 0,
      recentEvents: []
    }
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
        <p className="text-gray-600 mt-2">סקירה כללית על פעילות החברה</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎵</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">אירועים</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.eventsCount}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.grossRevenue)}</p>
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
              <p className="text-sm text-gray-500">הוצאות</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalCosts)}</p>
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
              <p className="text-sm text-gray-500">רווח נקי</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.netRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏦</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">יתרת שותפים</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.partnerHoldings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">אירועים אחרונים</h2>
        {stats.recentEvents.length > 0 ? (
          <div className="space-y-3">
            {stats.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.clientName}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString('he-IL')}</p>
                  <span className={`status-badge ${getStatusClass(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">אין אירועים אחרונים</p>
        )}
      </div>
    </div>
  )
}

function getStatusClass(status: EventStatus) {
  switch (status) {
    case 'CONFIRMED': return 'status-won'
    case 'DRAFT': return 'status-new'
    case 'CANCELLED': return 'status-lost'
    case 'DONE': return 'bg-gray-100 text-gray-800'
    default: return 'status-new'
  }
}

function getStatusText(status: EventStatus) {
  switch (status) {
    case 'CONFIRMED': return 'מאושר'
    case 'DRAFT': return 'טיוטה'
    case 'CANCELLED': return 'בוטל'
    case 'DONE': return 'הסתיים'
    default: return status
  }
}