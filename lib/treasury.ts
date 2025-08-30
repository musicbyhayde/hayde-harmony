import { TransactionDirection, PaymentMethod, CounterpartyType } from '@prisma/client'
import { prisma } from './prisma'
import { dayjs } from './dayjs'

export interface TreasuryBalance {
  accountId: string
  displayName: string
  balance: number
  currency: string
}

export async function getTreasuryBalances(): Promise<TreasuryBalance[]> {
  const accounts = await prisma.treasuryAccount.findMany({
    where: { active: true },
    include: {
      transactions: {
        select: {
          direction: true,
          amount: true
        }
      }
    }
  })

  return accounts.map(account => {
    const totalIn = account.transactions
      .filter(t => t.direction === TransactionDirection.IN)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalOut = account.transactions
      .filter(t => t.direction === TransactionDirection.OUT)
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = account.openingBalance + totalIn - totalOut

    return {
      accountId: account.id,
      displayName: account.displayName,
      balance,
      currency: account.currency
    }
  })
}

export async function getPartnerHoldings(): Promise<number> {
  const balances = await getTreasuryBalances()
  
  return balances
    .filter(b => b.displayName.includes('Partner') || b.displayName.includes('Wallet'))
    .reduce((sum, b) => sum + b.balance, 0)
}

export async function createTreasuryTransaction(data: {
  accountId: string
  direction: TransactionDirection
  amount: number
  method: PaymentMethod
  counterpartyType: CounterpartyType
  counterpartyName: string
  linkEventId?: string
  linkExpenseId?: string
  linkRevenueId?: string
  linkSettlementId?: string
  notes?: string
  journalGroupId?: string
}) {
  const now = dayjs().toDate()
  
  return await prisma.treasuryTransaction.create({
    data: {
      date: now,
      currency: 'ILS',
      periodKey: dayjs().format('YYYY-MM'),
      verified: false,
      ...data
    }
  })
}

export async function transferBetweenAccounts(data: {
  fromAccountId: string
  toAccountId: string
  amount: number
  notes?: string
}) {
  const journalGroupId = `transfer_${Date.now()}`
  const now = dayjs().toDate()

  // Get account names for counterparty
  const [fromAccount, toAccount] = await Promise.all([
    prisma.treasuryAccount.findUnique({ where: { id: data.fromAccountId } }),
    prisma.treasuryAccount.findUnique({ where: { id: data.toAccountId } })
  ])

  if (!fromAccount || !toAccount) {
    throw new Error('Account not found')
  }

  // Create paired transactions
  await prisma.$transaction([
    prisma.treasuryTransaction.create({
      data: {
        date: now,
        accountId: data.fromAccountId,
        direction: TransactionDirection.OUT,
        amount: data.amount,
        currency: 'ILS',
        method: PaymentMethod.BANK_TRANSFER,
        counterpartyType: CounterpartyType.OTHER,
        counterpartyName: toAccount.displayName,
        notes: data.notes,
        journalGroupId,
        periodKey: dayjs().format('YYYY-MM'),
        verified: true
      }
    }),
    prisma.treasuryTransaction.create({
      data: {
        date: now,
        accountId: data.toAccountId,
        direction: TransactionDirection.IN,
        amount: data.amount,
        currency: 'ILS',
        method: PaymentMethod.BANK_TRANSFER,
        counterpartyType: CounterpartyType.OTHER,
        counterpartyName: fromAccount.displayName,
        notes: data.notes,
        journalGroupId,
        periodKey: dayjs().format('YYYY-MM'),
        verified: true
      }
    })
  ])

  return journalGroupId
}

// Auto-create treasury transactions for revenue/expense
export async function createRevenueTransaction(revenueId: string) {
  const revenue = await prisma.revenueItem.findUnique({
    where: { id: revenueId },
    include: { event: true }
  })

  if (!revenue?.receivedInAccountId) return

  await createTreasuryTransaction({
    accountId: revenue.receivedInAccountId,
    direction: TransactionDirection.IN,
    amount: revenue.amount,
    method: revenue.method,
    counterpartyType: CounterpartyType.CLIENT,
    counterpartyName: revenue.event.clientName,
    linkEventId: revenue.eventId,
    linkRevenueId: revenue.id,
    notes: `הכנסה מאירוע: ${revenue.event.title}`
  })
}

export async function createExpenseTransaction(expenseId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { event: true, vendor: true, musician: true }
  })

  if (!expense?.paidFromAccountId) return

  const counterpartyName = expense.vendorName || expense.musicianName || 
                          expense.vendor?.name || expense.musician?.name || 
                          'ספק לא ידוע'

  const counterpartyType = expense.vendorId ? CounterpartyType.VENDOR :
                          expense.musicianId ? CounterpartyType.MUSICIAN :
                          CounterpartyType.OTHER

  await createTreasuryTransaction({
    accountId: expense.paidFromAccountId,
    direction: TransactionDirection.OUT,
    amount: expense.amount,
    method: PaymentMethod.BANK_TRANSFER, // Default, could be enhanced
    counterpartyType,
    counterpartyName,
    linkEventId: expense.eventId,
    linkExpenseId: expense.id,
    notes: `הוצאה עבור אירוע: ${expense.event.title}`
  })
}