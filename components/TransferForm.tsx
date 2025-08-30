'use client'

import { useState } from 'react'
import { createTransfer } from '@/app/actions/treasury'

interface TreasuryAccount {
  id: string
  displayName: string
  type: string
}

interface TransferFormProps {
  accounts: TreasuryAccount[]
}

export default function TransferForm({ accounts }: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createTransfer(formData)
      if (result.success) {
        // Reset form
        const form = document.getElementById('transfer-form') as HTMLFormElement
        form?.reset()
      } else {
        alert(result.error || 'שגיאה בהעברת כספים')
      }
    } catch (error) {
      alert('שגיאה בהעברת כספים')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="transfer-form" action={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">מחשבון *</label>
        <select name="fromAccountId" required className="form-select">
          <option value="">בחר חשבון מקור</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">לחשבון *</label>
        <select name="toAccountId" required className="form-select">
          <option value="">בחר חשבון יעד</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">סכום *</label>
        <input
          name="amount"
          type="number"
          required
          min="0.01"
          step="0.01"
          className="form-input"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="form-label">הערות</label>
        <textarea
          name="notes"
          className="form-input"
          rows={2}
          placeholder="סיבת ההעברה..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
      >
        {isSubmitting ? 'מעביר...' : 'בצע העברה'}
      </button>
    </form>
  )
}