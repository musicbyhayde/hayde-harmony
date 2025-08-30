import type { Metadata } from 'next'
import './globals.css'
import { requireAuth } from '@/lib/auth'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import SessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export const metadata: Metadata = {
  title: 'היידה - ניהול אירועים',
  description: 'מערכת ניהול אירועים מוזיקליים',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="he" dir="rtl">
      <body>
        <SessionProvider session={session}>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </SessionProvider>
      </body>
    </html>
  )
}