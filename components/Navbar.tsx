'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MODERATOR': return 'bg-blue-100 text-blue-800'
      case 'MUSICIAN': return 'bg-green-100 text-green-800'
      case 'CLIENT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'מנהל מערכת'
      case 'MODERATOR': return 'מנהל'
      case 'MUSICIAN': return 'נגן'
      case 'CLIENT': return 'לקוח'
      default: return role
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            היידה
          </Link>
          
          <div className="flex items-center space-x-8 space-x-reverse">
            {/* Navigation Links */}
            <div className="flex space-x-6 space-x-reverse">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                דשבורד
              </Link>
              <Link 
                href="/leads" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                לידים
              </Link>
              <Link 
                href="/opportunities" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                הזדמנויות
              </Link>
              <Link 
                href="/events" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                אירועים
              </Link>
              <Link 
                href="/events/new" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                אירוע חדש
              </Link>
              <Link 
                href="/vendors" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                ספקים
              </Link>
              <Link 
                href="/treasury" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                קופה
              </Link>
              <Link 
                href="/reports" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                דוחות
              </Link>
            </div>

            {/* User Menu */}
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 space-x-reverse text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="text-right">
                    <div className="text-sm font-medium">{session.user.name}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleColor((session.user as any)?.role)}`}>
                      {getRoleText((session.user as any)?.role)}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {session.user.email}
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        יציאה
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  )
}