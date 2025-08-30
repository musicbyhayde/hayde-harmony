'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { transferSchema } from '@/lib/validation'
import { getTreasuryBalances, transferBetweenAccounts, getPartnerHoldings } from '@/lib/treasury'

export async function createTransfer(formData: FormData) {
  try {
    const rawData = {
      fromAccountId: formData.get('fromAccountId') as string,
      toAccountId: formData.get('toAccountId') as string,
      amount: parseFloat(formData.get('amount') as string),
      notes: formData.get('notes') as string
    }

    const validatedData = transferSchema.parse(rawData)
    
    await transferBetweenAccounts(validatedData)

    revalidatePath('/treasury')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating transfer:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה בהעברת כספים' 
    }
  }
}

export async function getTreasuryData() {
  try {
    const [balances, partnerHoldings, transactions] = await Promise.all([
      getTreasuryBalances(),
      getPartnerHoldings(),
      prisma.treasuryTransaction.findMany({
        take: 100,
        orderBy: { date: 'desc' },
        include: {
          account: {
            select: { displayName: true }
          },
          linkEvent: {
            select: { title: true }
          }
        }
      })
    ])

    return {
      balances,
      partnerHoldings,
      transactions
    }
  } catch (error: any) {
    console.error('Error fetching treasury data:', error)
    return {
      balances: [],
      partnerHoldings: 0,
      transactions: []
    }
  }
}

export async function getTreasuryAccounts() {
  try {
    return await prisma.treasuryAccount.findMany({
      where: { active: true },
      orderBy: { displayName: 'asc' }
    })
  } catch (error: any) {
    console.error('Error fetching treasury accounts:', error)
    return []
  }
}