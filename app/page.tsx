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
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-bold mb-2">ברוכים הבאים לדשבורד היידה</h1>
        <p className="text-blue-100 text-lg">סקירה כללית על פעילות החברה והנתונים המעודכנים</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🎵</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-slate-600 font-medium">אירועים</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{stats.eventsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💰</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-slate-600 font-medium">הכנסות ברוטו</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">{formatCurrency(stats.grossRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💸</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-slate-600 font-medium">הוצאות</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-800 bg-clip-text text-transparent">{formatCurrency(stats.totalCosts)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📊</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-slate-600 font-medium">רווח נקי</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">{formatCurrency(stats.netRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🏦</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-slate-600 font-medium">יתרת שותפים</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-800 bg-clip-text text-transparent">{formatCurrency(stats.partnerHoldings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm">🗓️</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-800 bg-clip-text text-transparent">אירועים אחרונים</h2>
        </div>
        {stats.recentEvents.length > 0 ? (
          <div className="space-y-4">
            {stats.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/50 to-blue-50/30 hover:from-white/70 hover:to-blue-50/50 transition-all duration-200 border border-white/30">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-4"></div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
                    <p className="text-sm text-slate-600 font-medium">{event.clientName}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-700 mb-1">{new Date(event.date).toLocaleDateString('he-IL')}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-500 text-2xl">📋</span>
            </div>
            <p className="text-gray-500 text-lg font-medium">אין אירועים אחרונים</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusClass(status: EventStatus) {
  switch (status) {
    case 'CONFIRMED': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
    case 'DRAFT': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
    case 'CANCELLED': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
    case 'DONE': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
    default: return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
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