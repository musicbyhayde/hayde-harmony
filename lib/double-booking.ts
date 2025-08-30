import { AssignmentStatus } from '@prisma/client'
import { prisma } from './prisma'

export async function checkDoubleBooking(
  musicianId: string,
  eventId: string,
  excludeAssignmentId?: string
): Promise<boolean> {
  // Get the event times
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { startTime: true, endTime: true }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  // Find overlapping accepted assignments
  const whereClause: any = {
    musicianId,
    status: AssignmentStatus.ACCEPTED,
    event: {
      OR: [
        // Event starts before our event ends and ends after our event starts
        {
          AND: [
            { startTime: { lt: event.endTime } },
            { endTime: { gt: event.startTime } }
          ]
        }
      ]
    }
  }

  // Exclude current assignment if updating
  if (excludeAssignmentId) {
    whereClause.id = { not: excludeAssignmentId }
  }

  // Don't check against the same event
  whereClause.eventId = { not: eventId }

  const conflictingAssignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true
        }
      }
    }
  })

  return conflictingAssignments.length > 0
}

export async function getConflictingEvents(
  musicianId: string,
  eventId: string,
  excludeAssignmentId?: string
) {
  const hasConflict = await checkDoubleBooking(musicianId, eventId, excludeAssignmentId)
  
  if (!hasConflict) {
    return []
  }

  // Get the event times
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { startTime: true, endTime: true }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  const whereClause: any = {
    musicianId,
    status: AssignmentStatus.ACCEPTED,
    event: {
      OR: [
        {
          AND: [
            { startTime: { lt: event.endTime } },
            { endTime: { gt: event.startTime } }
          ]
        }
      ]
    }
  }

  if (excludeAssignmentId) {
    whereClause.id = { not: excludeAssignmentId }
  }

  whereClause.eventId = { not: eventId }

  const conflictingAssignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true
        }
      }
    }
  })

  return conflictingAssignments.map(assignment => assignment.event)
}