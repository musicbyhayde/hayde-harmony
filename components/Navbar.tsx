'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm'
      case 'MODERATOR': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
      case 'MUSICIAN': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
      case 'CLIENT': return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-sm'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
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
    <nav className="bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg border-b border-blue-100 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-18">
          <Link href="/" className="flex items-center space-x-3 space-x-reverse hover:opacity-80 transition-opacity">
            <Image
              src="/transparent_black_foreground.png"
              alt="היידה לוגו"
              width={48}
              height={48}
              className="object-contain"
            />
          </Link>
          
          <div className="flex items-center space-x-8 space-x-reverse">
            {/* Navigation Links */}
            <div className="flex space-x-1 space-x-reverse">
              <Link 
                href="/" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                דשבורד
              </Link>
              <Link 
                href="/leads" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                לידים
              </Link>
              <Link 
                href="/opportunities" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                הזדמנויות
              </Link>
              <Link 
                href="/events" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                אירועים
              </Link>
              <Link 
                href="/events/new" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-200 font-medium shadow-sm"
              >
                אירוע חדש
              </Link>
              <Link 
                href="/vendors" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                ספקים
              </Link>
              <Link 
                href="/treasury" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                קופה
              </Link>
              <Link 
                href="/reports" 
                className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                דוחות
              </Link>
            </div>

            {/* User Menu */}
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 space-x-reverse bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm border border-white/20"
                >
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                  )}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-800">{session.user.name}</div>
                    <div className={`text-xs px-3 py-1 rounded-full inline-block font-medium ${getRoleColor((session.user as any)?.role)}`}>
                      {getRoleText((session.user as any)?.role)}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden">
                    <div className="py-2">
                      <div className="px-4 py-3 text-sm text-slate-600 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="font-medium text-slate-800">{session.user.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{session.user.email}</div>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="flex items-center w-full text-right px-4 py-3 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 font-medium"
                      >
                        <span className="mr-2">←</span>
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