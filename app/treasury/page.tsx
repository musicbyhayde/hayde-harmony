import { getTreasuryData, getTreasuryAccounts } from '@/app/actions/treasury'
import { formatCurrency } from '@/lib/currency'
import { formatDateTimeHe } from '@/lib/dayjs'
import TransferForm from '@/components/TransferForm'

export default async function TreasuryPage() {
  const [treasuryData, accounts] = await Promise.all([
    getTreasuryData(),
    getTreasuryAccounts()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">קופה</h1>
        <p className="text-gray-600 mt-2">ניהול כספים, יתרות והעברות</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">יתרת שותפים</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(treasuryData.partnerHoldings)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏦</span>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-500">סה״כ יתרות</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(treasuryData.balances.reduce((sum, b) => sum + b.balance, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Balances */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">יתרות חשבונות</h2>
          </div>
          
          <div className="space-y-3">
            {treasuryData.balances.map((balance) => (
              <div key={balance.accountId} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{balance.displayName}</div>
                  <div className="text-sm text-gray-500">{balance.currency}</div>
                </div>
                <div className={`text-lg font-semibold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">העברת כספים</h2>
          <TransferForm accounts={accounts} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">תנועות אחרונות</h2>
        
        {treasuryData.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>חשבון</th>
                  <th>כיוון</th>
                  <th>סכום</th>
                  <th>צד שני</th>
                  <th>אירוע מקושר</th>
                  <th>הערות</th>
                </tr>
              </thead>
              <tbody>
                {treasuryData.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDateTimeHe(transaction.date)}</td>
                    <td>{transaction.account.displayName}</td>
                    <td>
                      <span className={`status-badge ${transaction.direction === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {transaction.direction === 'IN' ? 'כניסה' : 'יציאה'}
                      </span>
                    </td>
                    <td className={`font-medium ${transaction.direction === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.direction === 'IN' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{transaction.counterpartyName}</div>
                        <div className="text-sm text-gray-500">{getCounterpartyTypeText(transaction.counterpartyType)}</div>
                      </div>
                    </td>
                    <td>
                      {transaction.linkEvent ? (
                        <span className="text-blue-600">{transaction.linkEvent.title}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {transaction.notes || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💸</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין תנועות</h3>
            <p className="text-gray-500">תנועות כספיות יופיעו כאן</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getCounterpartyTypeText(type: string) {
  switch (type) {
    case 'CLIENT': return 'לקוח'
    case 'VENDOR': return 'ספק'
    case 'MUSICIAN': return 'נגן'
    case 'PARTNER': return 'שותף'
    case 'OTHER': return 'אחר'
    default: return type
  }
}