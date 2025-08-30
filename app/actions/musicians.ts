'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createMusicianSchema } from '@/lib/validation'

export async function createMusician(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      roles: formData.get('roles') as string,
      instruments: formData.get('instruments') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      rateRange: formData.get('rateRange') as string,
      notes: formData.get('notes') as string
    }

    const validatedData = createMusicianSchema.parse(rawData)
    
    await prisma.musician.create({
      data: validatedData
    })

    revalidatePath('/musicians')
    return { success: true }
  } catch (error: any) {
    console.error('Error creating musician:', error)
    return { 
      success: false, 
      error: error.message || 'שגיאה ביצירת הנגן' 
    }
  }
}

export async function getMusicians() {
  try {
    return await prisma.musician.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error: any) {
    console.error('Error fetching musicians:', error)
    return []
  }
}

export async function getMusician(musicianId: string) {
  try {
    return await prisma.musician.findUnique({
      where: { id: musicianId },
      include: {
        assignments: {
          include: {
            event: {
              select: { title: true, date: true, startTime: true, endTime: true }
            }
          },
          orderBy: {
            event: { date: 'desc' }
          }
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching musician:', error)
    return null
  }
}