import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { prisma } from './prisma'
import { authOptions } from './auth-config'

// Get the current session
export async function getSession() {
  return await getServerSession(authOptions)
}

// Get the current user from database
export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      image: true,
      createdAt: true
    }
  })
  
  return user
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  // Role hierarchy: ADMIN > MODERATOR > MUSICIAN > CLIENT
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.MODERATOR]: 3,
    [UserRole.MUSICIAN]: 2,
    [UserRole.CLIENT]: 1
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Check if user has specific permissions
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = {
    [UserRole.ADMIN]: [
      '*' // All permissions
    ],
    [UserRole.MODERATOR]: [
      'leads.*',
      'opportunities.*',
      'events.*',
      'vendors.*',
      'musicians.*',
      'treasury.*',
      'reports.view',
      'settlements.*'
    ],
    [UserRole.MUSICIAN]: [
      'events.view_assigned',
      'assignments.accept_decline',
      'profile.update_own'
    ],
    [UserRole.CLIENT]: [
      'events.view_own',
      'payments.make',
      'documents.upload_own'
    ]
  }
  
  const userPermissions = permissions[userRole] || []
  
  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true
  }
  
  // Check for exact match
  if (userPermissions.includes(permission)) {
    return true
  }
  
  // Check for wildcard prefix match (e.g., 'leads.*' matches 'leads.create')
  return userPermissions.some(p => 
    p.endsWith('.*') && permission.startsWith(p.slice(0, -1))
  )
}

// Require authentication
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  if (!user.active) {
    redirect('/auth/deactivated')
  }
  
  return user
}

// Require specific role
export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()
  
  if (!hasRole(user.role, requiredRole)) {
    redirect('/auth/unauthorized')
  }
  
  return user
}

// Require specific permission
export async function requirePermission(permission: string) {
  const user = await requireAuth()
  
  if (!hasPermission(user.role, permission)) {
    redirect('/auth/unauthorized')
  }
  
  return user
}

// Check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === UserRole.ADMIN
}

// Check if user is moderator or higher
export async function isModerator() {
  const user = await getCurrentUser()
  return user ? hasRole(user.role, UserRole.MODERATOR) : false
}

// Get user role display text
export function getRoleDisplayText(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN: return 'מנהל מערכת'
    case UserRole.MODERATOR: return 'מנהל'
    case UserRole.MUSICIAN: return 'נגן'
    case UserRole.CLIENT: return 'לקוח'
    default: return role
  }
}