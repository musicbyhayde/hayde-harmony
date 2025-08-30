'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createEventSchema } from '@/lib/validation'
import { computeAndSaveSettlement } from '@/lib/settlement'

export async function createEvent(formData: FormData) {
  try {
    const rawData = {
      clientName: formData.get('clientName') as string,
      clientPhone: formData.get('clientPhone') as string,
      clientEmail: formData.get('clientEmail') as string,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      venue: formData.get('venue') as string,
      dealMode: formData.get('dealMode') as any,
      splitPolicyId: formData.get('splitPolicyId') as string,
      processingFees: formData.get('processingFees') ? parseFloat(formData.get('processingFees') as string) : 0,
      techNotes: formData.get('techNotes') as string,
      stagePlotUrl: formData.get('stagePlotUrl') as string,
      riderUrl: formData.get('riderUrl') as string
    }

    const validatedData = createEventSchema.parse(rawData)
    
    // Combine date and times
    const baseDate = validatedData.date
    const startTime = new Date(`${baseDate}T${validatedData.startTime}`)
    const endTime = new Date(`${baseDate}T${validatedData.endTime}`)
    const eventDate = new Date(baseDate)

    await prisma.event.create({
      data: {
        clientName: validatedData.clientName,
        clientPhone: validatedData.clientPhone,
        clientEmail: validatedData.clientEmail,
        title: validatedData.title,
        date: eventDate,
        startTime,
        endTime,
        venue: validatedData.venue,
        dealMode: validatedData.dealMode,
        splitPolicyId: validatedData.splitPolicyId || null,
        processingFees: validatedData.processingFees,
        techNotes: validatedData.techNotes,
        stagePlotUrl: validatedData.stagePlotUrl,
        riderUrl: validatedData.riderUrl
      }
    })

    revalidatePath('/events')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating event:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת האירוע' 
    }
  }
}

export async function computeSettlement(eventId: string) {
  try {
    const calculation = await computeAndSaveSettlement(eventId)
    
    revalidatePath(`/events/${eventId}`)
    return { success: true, calculation }
  } catch (error: any) {
    console.error('Error computing settlement:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה בחישוב הסיכום' 
    }
  }
}

export async function lockSettlement(eventId: string) {
  try {
    await prisma.settlement.update({
      where: { eventId },
      data: { locked: true }
    })
    
    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error locking settlement:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה בנעילת הסיכום' 
    }
  }
}

export async function getEvents() {
  try {
    return await prisma.event.findMany({
      orderBy: { date: 'desc' },
      include: {
        assignments: {
          include: {
            musician: {
              select: { name: true }
            }
          }
        },
        settlement: true
      }
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEvent(eventId: string) {
  try {
    return await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          include: {
            musician: true
          }
        },
        revenueItems: {
          include: {
            receivedInAccount: {
              select: { displayName: true }
            }
          }
        },
        expenses: {
          include: {
            vendor: { select: { name: true } },
            musician: { select: { name: true } },
            paidFromAccount: {
              select: { displayName: true }
            }
          }
        },
        contractorAgreements: {
          include: {
            vendor: true
          }
        },
        settlement: true,
        splitPolicy: true
      }
    })
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function getEventFinancials(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        revenueItems: true,
        expenses: true,
        settlement: true
      }
    })

    if (!event) return null

    const grossRevenue = event.revenueItems.reduce((sum, item) => sum + item.amount, 0)
    const directCosts = event.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netRevenue = grossRevenue - directCosts - event.processingFees

    return {
      grossRevenue,
      directCosts,
      processingFees: event.processingFees,
      netRevenue,
      settlement: event.settlement
    }
  } catch (error: any) {
    console.error('Error fetching event financials:', error)
    return null
  }
}