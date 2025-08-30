import Link from 'next/link'
import { getEvents } from '@/app/actions/events'
import { formatDateHe, formatTimeHe } from '@/lib/dayjs'
import { formatCurrency } from '@/lib/currency'

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">אירועים</h1>
          <p className="text-gray-600 mt-2">ניהול כל האירועים והופעות</p>
        </div>
        <Link href="/events/new" className="btn btn-primary">
          אירוע חדש
        </Link>
      </div>

      {/* Events Table */}
      <div className="card">
        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>כותרת</th>
                  <th>לקוח</th>
                  <th>תאריך ושעה</th>
                  <th>מקום</th>
                  <th>צוות</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <Link 
                        href={`/events/${event.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {event.title}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{event.clientName}</div>
                        {event.clientPhone && (
                          <div className="text-sm text-gray-500">{event.clientPhone}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{formatDateHe(event.date)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTimeHe(event.startTime)} - {formatTimeHe(event.endTime)}
                        </div>
                      </div>
                    </td>
                    <td>{event.venue || '-'}</td>
                    <td>
                      <div className="text-sm">
                        {event.assignments.length} נגנים
                        {event.assignments.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {event.assignments.slice(0, 2).map(a => a.musician.name).join(', ')}
                            {event.assignments.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getEventStatusClass(event.status)}`}>
                        {getEventStatusText(event.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="text-sm btn btn-secondary"
                        >
                          פרטים
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין אירועים</h3>
            <p className="text-gray-500 mb-4">התחל על ידי יצירת אירוע חדש</p>
            <Link href="/events/new" className="btn btn-primary">
              צור אירוע חדש
            </Link>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📅</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">סה״כ אירועים</p>
              <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✅</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">מאושרים</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.filter(e => e.status === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👨‍🎤</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">נגנים פעילים</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(events.flatMap(e => e.assignments.map(a => a.musician.name))).size}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">רווח נטו (מחושב)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(events.reduce((sum, event) => sum + (event.settlement?.netRevenue || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getEventStatusClass(status: string) {
  switch (status) {
    case 'CONFIRMED': return 'status-won'
    case 'DRAFT': return 'status-new'
    case 'CANCELLED': return 'status-lost'
    case 'DONE': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getEventStatusText(status: string) {
  switch (status) {
    case 'CONFIRMED': return 'מאושר'
    case 'DRAFT': return 'טיוטה'
    case 'CANCELLED': return 'בוטל'
    case 'DONE': return 'הסתיים'
    default: return status
  }
}