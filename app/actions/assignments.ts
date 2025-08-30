'use server'

import { revalidatePath } from 'next/cache'
import { AssignmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createAssignmentSchema } from '@/lib/validation'
import { checkDoubleBooking, getConflictingEvents } from '@/lib/double-booking'

export async function createOrUpdateAssignment(formData: FormData) {
  try {
    const rawData = {
      eventId: formData.get('eventId') as string,
      musicianId: formData.get('musicianId') as string,
      role: formData.get('role') as string,
      agreedFee: formData.get('agreedFee') ? parseFloat(formData.get('agreedFee') as string) : undefined,
      status: formData.get('status') as AssignmentStatus,
      notes: formData.get('notes') as string
    }

    const assignmentId = formData.get('assignmentId') as string

    const validatedData = createAssignmentSchema.parse(rawData)
    
    // Check for double booking if setting to ACCEPTED
    if (validatedData.status === AssignmentStatus.ACCEPTED) {
      const hasConflict = await checkDoubleBooking(
        validatedData.musicianId, 
        validatedData.eventId,
        assignmentId
      )
      
      if (hasConflict) {
        const conflictingEvents = await getConflictingEvents(
          validatedData.musicianId,
          validatedData.eventId,
          assignmentId
        )
        
        const eventTitles = conflictingEvents.map(e => e.title).join(', ')
        throw new Error(`הנגן כבר מוזמן לאירועים: ${eventTitles}`)
      }
    }

    if (assignmentId) {
      // Update existing assignment
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: validatedData
      })
    } else {
      // Create new assignment
      await prisma.assignment.create({
        data: validatedData
      })
    }

    revalidatePath(`/events/${validatedData.eventId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error creating/updating assignment:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה בעדכון השיוך' 
    }
  }
}

export async function deleteAssignment(assignmentId: string, eventId: string) {
  try {
    await prisma.assignment.delete({
      where: { id: assignmentId }
    })

    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting assignment:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה במחיקת השיוך' 
    }
  }
}

export async function getAssignments(eventId: string) {
  try {
    return await prisma.assignment.findMany({
      where: { eventId },
      include: {
        musician: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error: any) {
    console.error('Error fetching assignments:', error)
    return []
  }
}