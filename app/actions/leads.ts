'use server'

import { revalidatePath } from 'next/cache'
import { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createLeadSchema, updateLeadStatusSchema } from '@/lib/validation'

export async function createLead(formData: FormData) {
  try {
    const rawData = {
      source: formData.get('source') as string,
      clientName: formData.get('clientName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      eventType: formData.get('eventType') as string,
      location: formData.get('location') as string,
      budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : undefined,
      notes: formData.get('notes') as string,
      date: formData.get('date') ? new Date(formData.get('date') as string).toISOString() : undefined
    }

    const validatedData = createLeadSchema.parse(rawData)
    
    await prisma.lead.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : null
      }
    })

    revalidatePath('/leads')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating lead:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת הליד' 
    }
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  try {
    const validatedData = updateLeadStatusSchema.parse({ status })
    
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: validatedData.status }
    })

    revalidatePath('/leads')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating lead status:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה בעדכון סטטוס הליד' 
    }
  }
}

export async function getLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        opportunities: {
          select: {
            id: true,
            stage: true,
            price: true
          }
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching leads:', error)
    return []
  }
}

export async function getLeadsByStatus() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        opportunities: {
          select: {
            id: true,
            stage: true,
            price: true
          }
        }
      }
    })

    // Group by status
    const grouped: Record<LeadStatus, typeof leads> = {
      NEW: [],
      CONTACTED: [],
      QUOTED: [],
      CONTRACT: [],
      DEPOSIT: [],
      BALANCE: [],
      WON: [],
      LOST: []
    }

    leads.forEach(lead => {
      grouped[lead.status].push(lead)
    })

    return grouped
  } catch (error: any) {
    console.error('Error fetching leads by status:', error)
    return {
      NEW: [],
      CONTACTED: [],
      QUOTED: [],
      CONTRACT: [],
      DEPOSIT: [],
      BALANCE: [],
      WON: [],
      LOST: []
    }
  }
}