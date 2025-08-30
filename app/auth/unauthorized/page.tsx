import Link from 'next/link'
import { getCurrentUser, getRoleDisplayText } from '@/lib/auth'

export default async function UnauthorizedPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">היידה</div>
          <div className="text-gray-600">מערכת ניהול אירועים</div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-orange-500 text-6xl mb-4">🚫</div>
          
          <h1 className="text-2xl font-semibold text-gray-900">אין הרשאה</h1>
          
          <p className="text-gray-700">
            אין לך הרשאות מספיקות לגישה לדף זה.
          </p>
          
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <div className="font-medium text-blue-800">פרטי המשתמש:</div>
              <div className="text-blue-700 mt-1">
                שם: {user.name}<br />
                אימייל: {user.email}<br />
                תפקיד: {getRoleDisplayText(user.role)}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              חזרה לדף הבית
            </Link>
            
            <div className="text-sm text-gray-500">
              לבקשת הרשאות נוספות, פנה למנהל המערכת:<br />
              <a href="mailto:musicbyhayde@gmail.com" className="text-blue-600 hover:underline">
                musicbyhayde@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}