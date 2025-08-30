'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'
import LoadingSpinner from './LoadingSpinner'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // Pages that don't require authentication
  const publicPages = ['/auth/signin', '/auth/error', '/auth/unauthorized']
  const isPublicPage = publicPages.includes(pathname)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!isPublicPage && !session) {
      // Redirect to sign in if not authenticated and not on a public page
      router.push('/auth/signin')
    }
  }, [status, session, isPublicPage, router])

  // Show loading spinner while session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // If it's a public page, render without navbar
  if (isPublicPage) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">{children}</div>
  }

  // If not authenticated and not on public page, show nothing (redirect will happen)
  if (!session) {
    return null
  }

  // Authenticated layout with navbar
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}