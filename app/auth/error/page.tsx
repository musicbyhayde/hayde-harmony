'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'גישה נדחתה',
          message: 'חשבון Google שלך אינו מורשה לגישה למערכת זו.',
          details: 'רק משתמשים מאושרים מראש יכולים להיכנס למערכת ניהול האירועים של היידה.'
        }
      case 'Configuration':
        return {
          title: 'שגיאת הגדרות',
          message: 'יש בעיה בהגדרות המערכת.',
          details: 'נא פנה למנהל המערכת לפתרון הבעיה.'
        }
      default:
        return {
          title: 'שגיאת כניסה',
          message: 'אירעה שגיאה בעת הכניסה למערכת.',
          details: 'נא נסה שוב או פנה למנהל המערכת אם הבעיה נמשכת.'
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">היידה</div>
          <div className="text-gray-600">מערכת ניהול אירועים</div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          
          <h1 className="text-2xl font-semibold text-gray-900">{errorInfo.title}</h1>
          
          <p className="text-gray-700">{errorInfo.message}</p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            {errorInfo.details}
          </div>

          <div className="space-y-3 pt-4">
            <Link
              href="/auth/signin"
              className="block w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              נסה שוב
            </Link>
            
            <div className="text-sm text-gray-500">
              לבעיות גישה, פנה למנהל המערכת:<br />
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