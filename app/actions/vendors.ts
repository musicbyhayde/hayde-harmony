'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createVendorSchema } from '@/lib/validation'

export async function createVendor(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      contact: formData.get('contact') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      defaultRates: formData.get('defaultRates') as string,
      terms: formData.get('terms') as string,
      documentsUrl: formData.get('documentsUrl') as string,
      rating: formData.get('rating') ? parseInt(formData.get('rating') as string) : undefined,
      notes: formData.get('notes') as string
    }

    const validatedData = createVendorSchema.parse(rawData)
    
    await prisma.vendor.create({
      data: validatedData
    })

    revalidatePath('/vendors')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating vendor:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת הספק' 
    }
  }
}

export async function getVendors() {
  try {
    return await prisma.vendor.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error: any) {
    console.error('Error fetching vendors:', error)
    return []
  }
}

export async function getVendor(vendorId: string) {
  try {
    return await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        contractorAgreements: {
          include: {
            event: {
              select: { title: true, date: true }
            }
          }
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching vendor:', error)
    return null
  }
}