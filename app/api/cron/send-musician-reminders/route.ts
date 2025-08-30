import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMusicianReminder } from '@/lib/mailer'
import { formatDateHe, formatTimeHe, dayjs } from '@/lib/dayjs'
import { AssignmentStatus, NotificationType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const windowHours = parseInt(url.searchParams.get('windowHours') || '24')
    
    return await sendReminders(windowHours)
  } catch (error: any) {
    console.error('Error in cron job:', error)
    return NextResponse.json({ 
      error: error.message || 'שגיאה בשליחת תזכורות',
      success: false 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Allow manual triggering for local development
  const url = new URL(request.url)
  const windowHours = parseInt(url.searchParams.get('windowHours') || '24')
  
  return await sendReminders(windowHours)
}

async function sendReminders(windowHours: number) {
  const now = dayjs()
  const windowStart = now
  const windowEnd = now.add(windowHours, 'hours')
  
  console.log(`Looking for events between ${windowStart.format()} and ${windowEnd.format()}`)

  // Find events starting within the window
  const events = await prisma.event.findMany({
    where: {
      startTime: {
        gte: windowStart.toDate(),
        lte: windowEnd.toDate()
      },
      status: {
        in: ['CONFIRMED', 'DRAFT']
      }
    },
    include: {
      assignments: {
        where: {
          status: AssignmentStatus.ACCEPTED
        },
        include: {
          musician: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  console.log(`Found ${events.length} events in window`)

  let emailsSent = 0
  let errors: string[] = []

  for (const event of events) {
    for (const assignment of event.assignments) {
      const { musician } = assignment
      
      // Skip if musician has no email
      if (!musician.email) {
        console.log(`Skipping musician ${musician.name} - no email`)
        continue
      }

      // Create deduplication key
      const dedupeKey = `${event.id}:${musician.id}:${windowHours}:${now.format('YYYYMMDDHH')}`
      
      // Check if already sent
      const existingLog = await prisma.notificationLog.findUnique({
        where: { dedupeKey }
      })

      if (existingLog) {
        console.log(`Skipping - already sent to ${musician.name} for event ${event.title}`)
        continue
      }

      try {
        // Send email
        await sendMusicianReminder({
          musicianName: musician.name,
          musicianEmail: musician.email,
          eventTitle: event.title,
          eventDate: formatDateHe(event.date),
          startTime: formatTimeHe(event.startTime),
          endTime: formatTimeHe(event.endTime),
          venue: event.venue || undefined,
          role: assignment.role || undefined,
          fee: assignment.agreedFee || undefined,
          calendarLink: event.calendarHtmlLink || undefined
        })

        // Log the notification
        await prisma.notificationLog.create({
          data: {
            type: NotificationType.MUSICIAN_REMINDER,
            eventId: event.id,
            musicianId: musician.id,
            scheduledFor: event.startTime,
            sentAt: now.toDate(),
            channel: 'email',
            dedupeKey
          }
        })

        emailsSent++
        console.log(`Sent reminder to ${musician.name} for event ${event.title}`)
        
      } catch (error: any) {
        const errorMsg = `Failed to send to ${musician.name}: ${error.message}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
  }

  const response = {
    success: true,
    message: `נשלחו ${emailsSent} תזכורות`,
    details: {
      eventsFound: events.length,
      emailsSent,
      errors,
      windowHours,
      timeRange: `${windowStart.format('DD/MM HH:mm')} - ${windowEnd.format('DD/MM HH:mm')}`
    }
  }

  console.log('Cron job completed:', response)
  return NextResponse.json(response)
}