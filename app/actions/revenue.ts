'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createRevenueItemSchema } from '@/lib/validation'
import { createRevenueTransaction } from '@/lib/treasury'

export async function createRevenueItem(formData: FormData) {
  try {
    const rawData = {
      eventId: formData.get('eventId') as string,
      type: formData.get('type') as any,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'ILS',
      includesVat: formData.get('includesVat') === 'true',
      vatRate: parseFloat(formData.get('vatRate') as string || '0.17'),
      date: formData.get('date') as string,
      reference: formData.get('reference') as string,
      method: formData.get('method') as any,
      receivedInAccountId: formData.get('receivedInAccountId') as string || undefined
    }

    const validatedData = createRevenueItemSchema.parse(rawData)
    
    const revenue = await prisma.revenueItem.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        receivedInAccountId: validatedData.receivedInAccountId || null
      }
    })

    // Auto-create treasury transaction if account specified
    if (revenue.receivedInAccountId) {
      await createRevenueTransaction(revenue.id)
    }

    revalidatePath(`/events/${validatedData.eventId}`)
    revalidatePath('/treasury')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating revenue item:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת פריט הכנסה' 
    }
  }
}

export async function getRevenueItems(eventId: string) {
  try {
    return await prisma.revenueItem.findMany({
      where: { eventId },
      orderBy: { date: 'desc' },
      include: {
        receivedInAccount: {
          select: { displayName: true }
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching revenue items:', error)
    return []
  }
}