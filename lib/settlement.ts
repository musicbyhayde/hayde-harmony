import { ProfitSplitType, Event, RevenueItem, Expense, ProfitSplitPolicy } from '@prisma/client'
import { prisma } from './prisma'

export type EventWithFinance = Event & {
  revenueItems: RevenueItem[]
  expenses: Expense[]
  splitPolicy?: ProfitSplitPolicy | null
}

export interface SettlementCalculation {
  grossRevenue: number
  directCosts: number
  processingFees: number
  netRevenue: number
  partnerADraw: number
  partnerBDraw: number
  businessFundContribution: number
}

export async function calculateSettlement(event: EventWithFinance): Promise<SettlementCalculation> {
  // Calculate totals
  const grossRevenue = event.revenueItems.reduce((sum, item) => sum + item.amount, 0)
  const directCosts = event.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const processingFees = event.processingFees
  const netRevenue = grossRevenue - directCosts - processingFees

  // Get split policy or use default
  let splitPolicy = event.splitPolicy
  if (!splitPolicy) {
    splitPolicy = await prisma.profitSplitPolicy.findFirst({
      where: { name: 'Default 50/50' }
    })
  }

  if (!splitPolicy) {
    throw new Error('No split policy found')
  }

  let partnerADraw = 0
  let partnerBDraw = 0
  let businessFundContribution = 0

  // Apply split policy
  switch (splitPolicy.type) {
    case ProfitSplitType.PERCENT:
      partnerADraw = Math.floor(netRevenue * splitPolicy.partnerAShare)
      partnerBDraw = Math.floor(netRevenue * splitPolicy.partnerBShare)
      businessFundContribution = Math.max(0, netRevenue - partnerADraw - partnerBDraw)
      break

    case ProfitSplitType.FIXED:
      partnerADraw = splitPolicy.partnerAShare
      partnerBDraw = splitPolicy.partnerBShare
      businessFundContribution = Math.max(0, netRevenue - partnerADraw - partnerBDraw)
      break

    case ProfitSplitType.MIX:
      const baseA = splitPolicy.partnerAShare
      const baseB = splitPolicy.partnerBShare
      const remaining = netRevenue - baseA - baseB
      const splitRemaining = remaining > 0 ? remaining / 2 : 0
      
      partnerADraw = baseA + Math.floor(splitRemaining)
      partnerBDraw = baseB + Math.floor(splitRemaining)
      businessFundContribution = Math.max(0, netRevenue - partnerADraw - partnerBDraw)
      break
  }

  // Enforce minimum fund floor by reducing partner draws symmetrically
  if (businessFundContribution < splitPolicy.minFundFloor) {
    const deficit = splitPolicy.minFundFloor - businessFundContribution
    const reductionPerPartner = Math.ceil(deficit / 2)
    
    partnerADraw = Math.max(0, partnerADraw - reductionPerPartner)
    partnerBDraw = Math.max(0, partnerBDraw - reductionPerPartner)
    businessFundContribution = netRevenue - partnerADraw - partnerBDraw
  }

  return {
    grossRevenue,
    directCosts,
    processingFees,
    netRevenue,
    partnerADraw,
    partnerBDraw,
    businessFundContribution
  }
}

export async function computeAndSaveSettlement(eventId: string): Promise<SettlementCalculation> {
  // Get event with finance data
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      revenueItems: true,
      expenses: true,
      splitPolicy: true
    }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  const calculation = await calculateSettlement(event)

  // Save or update settlement
  await prisma.settlement.upsert({
    where: { eventId },
    update: {
      grossRevenue: calculation.grossRevenue,
      directCosts: calculation.directCosts,
      processingFees: calculation.processingFees,
      netRevenue: calculation.netRevenue,
      partnerADraw: calculation.partnerADraw,
      partnerBDraw: calculation.partnerBDraw,
      businessFundContribution: calculation.businessFundContribution
    },
    create: {
      eventId,
      grossRevenue: calculation.grossRevenue,
      directCosts: calculation.directCosts,
      processingFees: calculation.processingFees,
      netRevenue: calculation.netRevenue,
      partnerADraw: calculation.partnerADraw,
      partnerBDraw: calculation.partnerBDraw,
      businessFundContribution: calculation.businessFundContribution
    }
  })

  return calculation
}