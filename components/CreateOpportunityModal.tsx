'use client'

import { useState } from 'react'
import { createOpportunityFromLead } from '@/app/actions/opportunities'
import { DealMode } from '@prisma/client'

interface Lead {
  id: string
  clientName: string
  eventType?: string | null
  budget?: number | null
}

interface CreateOpportunityModalProps {
  lead: Lead
  onClose: () => void
}

export default function CreateOpportunityModal({ lead, onClose }: CreateOpportunityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteLines, setQuoteLines] = useState([
    { description: '', qty: 1, unitPrice: 0, taxIncluded: true, vatRate: 0.17 }
  ])

  const addQuoteLine = () => {
    setQuoteLines([
      ...quoteLines,
      { description: '', qty: 1, unitPrice: 0, taxIncluded: true, vatRate: 0.17 }
    ])
  }

  const removeQuoteLine = (index: number) => {
    if (quoteLines.length > 1) {
      setQuoteLines(quoteLines.filter((_, i) => i !== index))
    }
  }

  const updateQuoteLine = (index: number, field: string, value: any) => {
    const updated = [...quoteLines]
    updated[index] = { ...updated[index], [field]: value }
    setQuoteLines(updated)
  }

  const calculateTotal = () => {
    return quoteLines.reduce((sum, line) => sum + (line.qty * line.unitPrice), 0)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      // Add quote lines to form data
      quoteLines.forEach((line, index) => {
        formData.append(`quoteLines[${index}][description]`, line.description)
        formData.append(`quoteLines[${index}][qty]`, line.qty.toString())
        formData.append(`quoteLines[${index}][unitPrice]`, line.unitPrice.toString())
        formData.append(`quoteLines[${index}][taxIncluded]`, line.taxIncluded.toString())
        formData.append(`quoteLines[${index}][vatRate]`, line.vatRate.toString())
      })

      const result = await createOpportunityFromLead(formData)
      if (result.success) {
        onClose()
      } else {
        alert(result.error || 'שגיאה ביצירת ההזדמנות')
      }
    } catch (error) {
      alert('שגיאה ביצירת ההזדמנות')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">הזדמנות חדשה - {lead.clientName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="leadId" value={lead.id} />

          <div>
            <label className="form-label">מצב עסקה *</label>
            <select name="dealMode" required className="form-select">
              <option value={DealMode.IN_HOUSE}>פנימי</option>
              <option value={DealMode.MANAGED_CONTRACTOR}>קבלן מנוהל</option>
              <option value={DealMode.REFERRAL_ONLY}>הפניה בלבד</option>
            </select>
          </div>

          <div>
            <label className="form-label">שם החבילה</label>
            <input
              name="packageName"
              type="text"
              className="form-input"
              placeholder="שם החבילה או התיאור"
              defaultValue={lead.eventType || ''}
            />
          </div>

          <div>
            <label className="form-label">הנחה</label>
            <input
              name="discount"
              type="number"
              className="form-input"
              defaultValue={0}
              min="0"
            />
          </div>

          <div>
            <label className="form-label">תוקף הצעה</label>
            <input
              name="validUntil"
              type="date"
              className="form-input"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="form-label">פריטי הצעה</label>
              <button
                type="button"
                onClick={addQuoteLine}
                className="text-sm btn btn-secondary"
              >
                הוסף פריט
              </button>
            </div>

            <div className="space-y-3">
              {quoteLines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="form-label text-xs">תיאור</label>
                    <input
                      type="text"
                      className="form-input text-sm"
                      value={line.description}
                      onChange={(e) => updateQuoteLine(index, 'description', e.target.value)}
                      placeholder="תיאור הפריט"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label text-xs">כמות</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={line.qty}
                      onChange={(e) => updateQuoteLine(index, 'qty', parseFloat(e.target.value) || 1)}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label text-xs">מחיר יחידה</label>
                    <input
                      type="number"
                      className="form-input text-sm"
                      value={line.unitPrice}
                      onChange={(e) => updateQuoteLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label text-xs">כולל מע״מ</label>
                    <select
                      className="form-select text-sm"
                      value={line.taxIncluded.toString()}
                      onChange={(e) => updateQuoteLine(index, 'taxIncluded', e.target.value === 'true')}
                    >
                      <option value="true">כן</option>
                      <option value="false">לא</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-600">סה״כ: ₪{(line.qty * line.unitPrice).toLocaleString('he-IL')}</div>
                    {quoteLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuoteLine(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        הסר
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-left">
              <strong>סה״כ: ₪{calculateTotal().toLocaleString('he-IL')}</strong>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'יצירה...' : 'צור הזדמנות'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}