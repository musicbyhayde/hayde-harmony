'use client'

import { useState } from 'react'
import { createLead } from '@/app/actions/leads'

export default function CreateLeadForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createLead(formData)
      if (result.success) {
        setIsOpen(false)
        // Reset form by creating new form element
        const form = document.getElementById('create-lead-form') as HTMLFormElement
        form?.reset()
      } else {
        alert(result.error || 'שגיאה ביצירת הליד')
      }
    } catch (error) {
      alert('שגיאה ביצירת הליד')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        ליד חדש
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">ליד חדש</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form id="create-lead-form" action={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">שם הלקוח *</label>
            <input
              name="clientName"
              type="text"
              required
              className="form-input"
              placeholder="שם הלקוח"
            />
          </div>

          <div>
            <label className="form-label">טלפון</label>
            <input
              name="phone"
              type="tel"
              className="form-input"
              placeholder="050-1234567"
            />
          </div>

          <div>
            <label className="form-label">אימייל</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="form-label">סוג האירוע</label>
            <input
              name="eventType"
              type="text"
              className="form-input"
              placeholder="חתונה, בר מצווה, אירוע עסקי..."
            />
          </div>

          <div>
            <label className="form-label">תאריך האירוע</label>
            <input
              name="date"
              type="date"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">מיקום</label>
            <input
              name="location"
              type="text"
              className="form-input"
              placeholder="עיר או שם המקום"
            />
          </div>

          <div>
            <label className="form-label">תקציב</label>
            <input
              name="budget"
              type="number"
              className="form-input"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="form-label">הערות</label>
            <textarea
              name="notes"
              className="form-input"
              rows={3}
              placeholder="הערות נוספות..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? 'שמירה...' : 'שמירה'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
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