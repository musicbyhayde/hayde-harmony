'use server'

import { revalidatePath } from 'next/cache'
import { OpportunityStage, LeadStatus, EventStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createOpportunitySchema } from '@/lib/validation'

export async function createOpportunityFromLead(formData: FormData) {
  try {
    const quoteLines = []
    let index = 0
    
    // Parse quote lines from form data
    while (formData.get(`quoteLines[${index}][description]`)) {
      quoteLines.push({
        description: formData.get(`quoteLines[${index}][description]`) as string,
        qty: parseFloat(formData.get(`quoteLines[${index}][qty]`) as string || '1'),
        unitPrice: parseFloat(formData.get(`quoteLines[${index}][unitPrice]`) as string || '0'),
        taxIncluded: formData.get(`quoteLines[${index}][taxIncluded]`) === 'true',
        vatRate: parseFloat(formData.get(`quoteLines[${index}][vatRate]`) as string || '0.17')
      })
      index++
    }

    const rawData = {
      leadId: formData.get('leadId') as string,
      dealMode: formData.get('dealMode') as any,
      packageName: formData.get('packageName') as string,
      discount: formData.get('discount') ? parseFloat(formData.get('discount') as string) : 0,
      validUntil: formData.get('validUntil') as string,
      quoteLines
    }

    const validatedData = createOpportunitySchema.parse(rawData)
    
    // Calculate total price
    const totalPrice = validatedData.quoteLines.reduce((sum, line) => {
      const lineTotal = line.qty * line.unitPrice
      return sum + lineTotal
    }, 0) - validatedData.discount

    const opportunity = await prisma.opportunity.create({
      data: {
        leadId: validatedData.leadId,
        dealMode: validatedData.dealMode,
        packageName: validatedData.packageName,
        discount: validatedData.discount,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        price: totalPrice,
        quoteLines: {
          create: validatedData.quoteLines
        }
      }
    })

    // Update lead status to QUOTED
    await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: { status: LeadStatus.QUOTED }
    })

    revalidatePath('/leads')
    revalidatePath('/opportunities')
    return { success: true, opportunityId: opportunity.id }
  } catch (error: any) {
    console.error('Error creating opportunity:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת ההזדמנות' 
    }
  }
}

export async function winOpportunity(opportunityId: string, formData: FormData) {
  try {
    // Get opportunity with lead details
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { lead: true }
    })

    if (!opportunity) {
      throw new Error('ההזדמנות לא נמצאה')
    }

    if (opportunity.stage === OpportunityStage.WON) {
      throw new Error('ההזדמנות כבר מנוצחת')
    }

    // Parse event details from form
    const eventData = {
      clientName: (formData.get('clientName') as string) || opportunity.lead.clientName,
      clientPhone: (formData.get('clientPhone') as string) || opportunity.lead.phone,
      clientEmail: (formData.get('clientEmail') as string) || opportunity.lead.email,
      title: formData.get('title') as string,
      date: new Date(formData.get('date') as string),
      startTime: new Date(formData.get('startTime') as string),
      endTime: new Date(formData.get('endTime') as string),
      venue: (formData.get('venue') as string) || opportunity.lead.location,
      dealMode: opportunity.dealMode,
      processingFees: formData.get('processingFees') ? parseFloat(formData.get('processingFees') as string) : 0
    }

    // Create event and update opportunity
    await prisma.$transaction([
      prisma.opportunity.update({
        where: { id: opportunityId },
        data: { stage: OpportunityStage.WON }
      }),
      prisma.event.create({
        data: {
          ...eventData,
          status: EventStatus.CONFIRMED
        }
      }),
      prisma.lead.update({
        where: { id: opportunity.leadId },
        data: { status: LeadStatus.WON }
      })
    ])

    revalidatePath('/opportunities')
    revalidatePath('/events')
    revalidatePath('/leads')
    return { success: true }
  } catch (error: any) {
    console.error('Error winning opportunity:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה בניצחון ההזדמנות' 
    }
  }
}

export async function getOpportunities() {
  try {
    return await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: {
            clientName: true,
            phone: true,
            email: true,
            eventType: true,
            date: true,
            location: true
          }
        },
        quoteLines: true
      }
    })
  } catch (error: any) {
    console.error('Error fetching opportunities:', error)
    return []
  }
}