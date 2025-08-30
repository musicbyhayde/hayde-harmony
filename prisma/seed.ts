import { PrismaClient } from '@prisma/client'
import { ProfitSplitType, TreasuryAccountType, LeadStatus, DealMode, EventStatus, AssignmentStatus, VendorType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create treasury accounts
  console.log('Creating treasury accounts...')
  const partnerAWallet = await prisma.treasuryAccount.create({
    data: {
      type: TreasuryAccountType.PARTNER_WALLET,
      ownerPartner: 'Partner A',
      displayName: 'ארנק שותף א\'',
      openingBalance: 10000,
      currency: 'ILS',
      active: true
    }
  })

  const partnerBWallet = await prisma.treasuryAccount.create({
    data: {
      type: TreasuryAccountType.PARTNER_WALLET,
      ownerPartner: 'Kobi',
      displayName: 'ארנק קובי',
      openingBalance: 8000,
      currency: 'ILS',
      active: true
    }
  })

  const cashBox = await prisma.treasuryAccount.create({
    data: {
      type: TreasuryAccountType.CASH_BOX,
      displayName: 'קופה קטנה',
      openingBalance: 2000,
      currency: 'ILS',
      active: true
    }
  })

  // Create default split policy
  console.log('Creating default split policy...')
  const defaultPolicy = await prisma.profitSplitPolicy.create({
    data: {
      name: 'Default 50/50',
      type: ProfitSplitType.PERCENT,
      partnerAShare: 0.5,
      partnerBShare: 0.5,
      minFundFloor: 500,
      notes: 'מדיניות ברירת מחדל - חלוקה שווה 50/50 עם רצפה של 500 ₪ לקופה'
    }
  })

  // Create demo musicians
  console.log('Creating demo musicians...')
  const musician1 = await prisma.musician.create({
    data: {
      name: 'יוסי נגן',
      roles: 'סולן, גיטריסט',
      instruments: 'גיטרה, קלידים',
      phone: '050-1234567',
      email: 'yossi@example.com',
      rateRange: '1000-2000 ₪',
      notes: 'נגן מנוסה עם זמינות גבוהה'
    }
  })

  const musician2 = await prisma.musician.create({
    data: {
      name: 'שרה הזמרת',
      roles: 'זמרת',
      instruments: 'ווקלים',
      phone: '052-9876543',
      email: 'sarah@example.com',
      rateRange: '800-1500 ₪',
      notes: 'קול מדהים, מתאימה לאירועים קלאסיים'
    }
  })

  // Create demo vendor
  console.log('Creating demo vendors...')
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'סאונד טכנולוגיות',
      type: VendorType.SOUND,
      contact: 'משה כהן',
      email: 'info@soundtech.co.il',
      phone: '03-1234567',
      defaultRates: 'מיקסר + רמקולים: 1500 ₪, תאורה בסיסית: 800 ₪',
      terms: 'תשלום מראש או ביום האירוע',
      rating: 5,
      notes: 'ספק אמין עם ציוד איכותי'
    }
  })

  // Create demo lead
  console.log('Creating demo lead...')
  const lead1 = await prisma.lead.create({
    data: {
      source: 'פייסבוק',
      clientName: 'דני ורותי',
      phone: '054-1122334',
      email: 'danny.ruti@example.com',
      eventType: 'חתונה',
      date: new Date('2024-06-15'),
      location: 'אולמי דיאמונד, פתח תקווה',
      budget: 15000,
      status: LeadStatus.NEW,
      notes: 'חתונה של 200 איש, מעוניינים בלהקה של 4 נגנים'
    }
  })

  // Create demo event
  console.log('Creating demo event...')
  const event1 = await prisma.event.create({
    data: {
      clientName: 'משפחת לוי',
      clientPhone: '050-7788990',
      clientEmail: 'levi.family@example.com',
      title: 'בר מצווה רועי לוי',
      date: new Date('2024-05-20'),
      startTime: new Date('2024-05-20T19:00:00'),
      endTime: new Date('2024-05-20T23:00:00'),
      venue: 'גן אירועים הדקל',
      dealMode: DealMode.IN_HOUSE,
      splitPolicyId: defaultPolicy.id,
      processingFees: 300,
      status: EventStatus.CONFIRMED,
      techNotes: 'צריך מיקרופון אלחוטי לנאומים'
    }
  })

  // Create demo assignments
  console.log('Creating demo assignments...')
  await prisma.assignment.create({
    data: {
      eventId: event1.id,
      musicianId: musician1.id,
      role: 'סולן ראשי',
      agreedFee: 1200,
      status: AssignmentStatus.ACCEPTED,
      notes: 'יביא גיטרה אקוסטית'
    }
  })

  await prisma.assignment.create({
    data: {
      eventId: event1.id,
      musicianId: musician2.id,
      role: 'זמרת משנה',
      agreedFee: 800,
      status: AssignmentStatus.ACCEPTED,
      notes: 'תשיר 3-4 שירים'
    }
  })

  // Create demo revenue and expenses
  console.log('Creating demo revenue and expenses...')
  await prisma.revenueItem.create({
    data: {
      eventId: event1.id,
      type: 'DEPOSIT',
      amount: 5000,
      currency: 'ILS',
      includesVat: true,
      vatRate: 0.17,
      date: new Date('2024-05-01'),
      reference: 'מקדמה בר מצווה לוי',
      method: 'BANK_TRANSFER',
      receivedInAccountId: partnerAWallet.id
    }
  })

  await prisma.expense.create({
    data: {
      eventId: event1.id,
      vendorId: vendor1.id,
      category: 'סאונד ותאורה',
      amount: 1500,
      currency: 'ILS',
      includesVat: true,
      vatRate: 0.17,
      paidBy: 'COMPANY',
      date: new Date('2024-05-20'),
      notes: 'תשלום לספק הסאונד',
      paidFromAccountId: cashBox.id
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`Created:
  - 3 Treasury accounts
  - 1 Split policy  
  - 2 Musicians
  - 1 Vendor
  - 1 Lead
  - 1 Event with assignments
  - Sample revenue and expense items
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })