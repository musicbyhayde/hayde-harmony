'use server'

import { revalidatePath } from 'next/cache'
import { createCalendarEvent } from '@/lib/calendar'

export async function createEventCalendar(eventId: string) {
  try {
    const htmlLink = await createCalendarEvent(eventId)
    
    revalidatePath(`/events/${eventId}`)
    return { 
      success: true, 
      htmlLink,
      message: 'אירוע נוצר בהצלחה ביומן גוגל'
    }
  } catch (error: any) {
    console.error('Error creating calendar event:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת אירוע ביומן' 
    }
  }
}