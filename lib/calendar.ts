import { google } from 'googleapis'
import { env, getGooglePrivateKey } from './env'
import { prisma } from './prisma'

let auth: any = null

function getGoogleAuth() {
  if (!auth) {
    auth = new google.auth.JWT(
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      getGooglePrivateKey(),
      ['https://www.googleapis.com/auth/calendar']
    )
  }
  return auth
}

export async function createCalendarEvent(eventId: string): Promise<string | null> {
  try {
    // Get event with accepted assignments
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          where: { status: 'ACCEPTED' },
          include: {
            musician: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    if (!event) {
      throw new Error('Event not found')
    }

    const calendar = google.calendar({ version: 'v3', auth: getGoogleAuth() })

    // Prepare attendees list
    const attendees = event.assignments
      .filter(assignment => assignment.musician.email)
      .map(assignment => ({
        email: assignment.musician.email!,
        displayName: assignment.musician.name,
        responseStatus: 'needsAction'
      }))

    // Create calendar event
    const calendarEvent = {
      summary: event.title,
      description: `אירוע: ${event.title}\nלקוח: ${event.clientName}\n${event.techNotes ? `הערות טכניות: ${event.techNotes}` : ''}`,
      location: event.venue || '',
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: event.endTime.toISOString(),  
        timeZone: 'Asia/Jerusalem'
      },
      attendees,
      sendUpdates: 'all' as const
    }

    const response = await calendar.events.insert({
      calendarId: env.CALENDAR_ID,
      requestBody: calendarEvent
    })

    // Save the calendar link to the event
    if (response.data.htmlLink) {
      await prisma.event.update({
        where: { id: eventId },
        data: { calendarHtmlLink: response.data.htmlLink }
      })
    }

    return response.data.htmlLink || null
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    throw new Error(`שגיאה ביצירת אירוע ביומן: ${error.message}`)
  }
}

export async function updateCalendarEvent(eventId: string, calendarEventId: string): Promise<void> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          where: { status: 'ACCEPTED' },
          include: {
            musician: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    if (!event) {
      throw new Error('Event not found')
    }

    const calendar = google.calendar({ version: 'v3', auth: getGoogleAuth() })

    const attendees = event.assignments
      .filter(assignment => assignment.musician.email)
      .map(assignment => ({
        email: assignment.musician.email!,
        displayName: assignment.musician.name,
        responseStatus: 'needsAction'
      }))

    const calendarEvent = {
      summary: event.title,
      description: `אירוע: ${event.title}\nלקוח: ${event.clientName}\n${event.techNotes ? `הערות טכניות: ${event.techNotes}` : ''}`,
      location: event.venue || '',
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      attendees,
      sendUpdates: 'all' as const
    }

    await calendar.events.update({
      calendarId: env.CALENDAR_ID,
      eventId: calendarEventId,
      requestBody: calendarEvent
    })
  } catch (error: any) {
    console.error('Error updating calendar event:', error)
    throw new Error(`שגיאה בעדכון אירוע ביומן: ${error.message}`)
  }
}