import { z } from 'zod'
import { LeadStatus, DealMode, OpportunityStage, EventStatus, AssignmentStatus, VendorType, CommissionType, RevenueType, PaymentMethod, PayeeType, PayoutStatus, PaidBy, ProfitSplitType, TreasuryAccountType, TransactionDirection, CounterpartyType } from '@prisma/client'

// Lead schemas
export const createLeadSchema = z.object({
  source: z.string().optional(),
  clientName: z.string().min(1, 'שם הלקוח נדרש'),
  phone: z.string().optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  eventType: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().positive().optional(),
  notes: z.string().optional()
})

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus)
})

// Opportunity schemas
export const createOpportunitySchema = z.object({
  leadId: z.string().min(1),
  dealMode: z.nativeEnum(DealMode),
  packageName: z.string().optional(),
  discount: z.number().min(0).default(0),
  validUntil: z.string().optional(),
  quoteLines: z.array(z.object({
    description: z.string().min(1, 'תיאור נדרש'),
    qty: z.number().positive().default(1),
    unitPrice: z.number().min(0, 'מחיר חייב להיות חיובי'),
    taxIncluded: z.boolean().default(true),
    vatRate: z.number().min(0).max(1).default(0.17)
  }))
})

// Event schemas  
export const createEventSchema = z.object({
  clientName: z.string().min(1, 'שם הלקוח נדרש'),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  title: z.string().min(1, 'כותרת האירוע נדרשת'),
  date: z.string().min(1, 'תאריך נדרש'),
  startTime: z.string().min(1, 'שעת התחלה נדרשת'),
  endTime: z.string().min(1, 'שעת סיום נדרשת'),
  venue: z.string().optional(),
  dealMode: z.nativeEnum(DealMode),
  splitPolicyId: z.string().optional(),
  processingFees: z.number().min(0).default(0),
  techNotes: z.string().optional(),
  stagePlotUrl: z.string().optional(),
  riderUrl: z.string().optional()
})

// Revenue schemas
export const createRevenueItemSchema = z.object({
  eventId: z.string().min(1),
  type: z.nativeEnum(RevenueType),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  currency: z.string().default('ILS'),
  includesVat: z.boolean().default(true),
  vatRate: z.number().min(0).max(1).default(0.17),
  date: z.string().min(1, 'תאריך נדרש'),
  reference: z.string().optional(),
  method: z.nativeEnum(PaymentMethod),
  receivedInAccountId: z.string().optional()
})

// Expense schemas
export const createExpenseSchema = z.object({
  eventId: z.string().min(1),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  musicianId: z.string().optional(),
  musicianName: z.string().optional(),
  category: z.string().min(1, 'קטגוריה נדרשת'),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  currency: z.string().default('ILS'),
  includesVat: z.boolean().default(true),
  vatRate: z.number().min(0).max(1).default(0.17),
  paidBy: z.nativeEnum(PaidBy),
  date: z.string().min(1, 'תאריך נדרש'),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  paidFromAccountId: z.string().optional()
})

// Assignment schemas
export const createAssignmentSchema = z.object({
  eventId: z.string().min(1),
  musicianId: z.string().min(1),
  role: z.string().optional(),
  agreedFee: z.number().positive().optional(),
  status: z.nativeEnum(AssignmentStatus).default(AssignmentStatus.PENDING),
  notes: z.string().optional()
})

// Vendor schemas
export const createVendorSchema = z.object({
  name: z.string().min(1, 'שם הספק נדרש'),
  type: z.nativeEnum(VendorType),
  contact: z.string().optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  defaultRates: z.string().optional(),
  terms: z.string().optional(),
  documentsUrl: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional()
})

// Musician schemas
export const createMusicianSchema = z.object({
  name: z.string().min(1, 'שם הנגן נדרש'),
  roles: z.string().optional(),
  instruments: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  rateRange: z.string().optional(),
  notes: z.string().optional()
})

// Treasury schemas
export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'חשבון מקור נדרש'),
  toAccountId: z.string().min(1, 'חשבון יעד נדרש'),
  amount: z.number().positive('הסכום חייב להיות חיובי'),
  notes: z.string().optional()
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'לא ניתן להעביר לאותו חשבון',
  path: ['toAccountId']
})

// Split policy schemas
export const createSplitPolicySchema = z.object({
  name: z.string().min(1, 'שם המדיניות נדרש'),
  type: z.nativeEnum(ProfitSplitType),
  partnerAShare: z.number().min(0, 'חלק שותף א\' חייב להיות חיובי'),
  partnerBShare: z.number().min(0, 'חלק שותף ב\' חייב להיות חיובי'),
  minFundFloor: z.number().min(0).default(0),
  notes: z.string().optional()
})