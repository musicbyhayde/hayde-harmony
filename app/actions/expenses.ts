'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createExpenseSchema } from '@/lib/validation'
import { createExpenseTransaction } from '@/lib/treasury'

export async function createExpense(formData: FormData) {
  try {
    const rawData = {
      eventId: formData.get('eventId') as string,
      vendorId: formData.get('vendorId') as string || undefined,
      vendorName: formData.get('vendorName') as string,
      musicianId: formData.get('musicianId') as string || undefined,
      musicianName: formData.get('musicianName') as string,
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'ILS',
      includesVat: formData.get('includesVat') === 'true',
      vatRate: parseFloat(formData.get('vatRate') as string || '0.17'),
      paidBy: formData.get('paidBy') as any,
      date: formData.get('date') as string,
      receiptUrl: formData.get('receiptUrl') as string,
      notes: formData.get('notes') as string,
      paidFromAccountId: formData.get('paidFromAccountId') as string || undefined
    }

    const validatedData = createExpenseSchema.parse(rawData)
    
    const expense = await prisma.expense.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        vendorId: validatedData.vendorId || null,
        musicianId: validatedData.musicianId || null,
        paidFromAccountId: validatedData.paidFromAccountId || null
      }
    })

    // Auto-create treasury transaction if account specified
    if (expense.paidFromAccountId) {
      await createExpenseTransaction(expense.id)
    }

    revalidatePath(`/events/${validatedData.eventId}`)
    revalidatePath('/treasury')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating expense:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת ההוצאה' 
    }
  }
}

export async function getExpenses(eventId: string) {
  try {
    return await prisma.expense.findMany({
      where: { eventId },
      orderBy: { date: 'desc' },
      include: {
        vendor: { select: { name: true } },
        musician: { select: { name: true } },
        paidFromAccount: {
          select: { displayName: true }
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching expenses:', error)
    return []
  }
}