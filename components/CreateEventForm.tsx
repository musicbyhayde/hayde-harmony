'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/app/actions/events'
import { DealMode } from '@prisma/client'

export default function CreateEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createEvent(formData)
      if (result.success) {
        router.push('/events')
      } else {
        alert(result.error || 'שגיאה ביצירת האירוע')
      }
    } catch (error) {
      alert('שגיאה ביצירת האירוע')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="form-label">טלפון לקוח</label>
          <input
            name="clientPhone"
            type="tel"
            className="form-input"
            placeholder="050-1234567"
          />
        </div>

        <div>
          <label className="form-label">אימייל לקוח</label>
          <input
            name="clientEmail"
            type="email"
            className="form-input"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="form-label">כותרת האירוע *</label>
          <input
            name="title"
            type="text"
            required
            className="form-input"
            placeholder="חתונה, בר מצווה, אירוע חברה..."
          />
        </div>

        <div>
          <label className="form-label">תאריך האירוע *</label>
          <input
            name="date"
            type="date"
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">שעת התחלה *</label>
          <input
            name="startTime"
            type="time"
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">שעת סיום *</label>
          <input
            name="endTime"
            type="time"
            required
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">מקום האירוע</label>
          <input
            name="venue"
            type="text"
            className="form-input"
            placeholder="שם האולם או המקום"
          />
        </div>

        <div>
          <label className="form-label">מצב עסקה *</label>
          <select name="dealMode" required className="form-select">
            <option value="">בחר מצב עסקה</option>
            <option value={DealMode.IN_HOUSE}>פנימי</option>
            <option value={DealMode.MANAGED_CONTRACTOR}>קבלן מנוהל</option>
            <option value={DealMode.REFERRAL_ONLY}>הפניה בלבד</option>
          </select>
        </div>

        <div>
          <label className="form-label">עמלות עיבוד</label>
          <input
            name="processingFees"
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="form-label">הערות טכניות</label>
        <textarea
          name="techNotes"
          className="form-input"
          rows={3}
          placeholder="הערות לצוות הטכני, דרישות מיוחדות..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">קישור לתרשים במה</label>
          <input
            name="stagePlotUrl"
            type="url"
            className="form-input"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="form-label">קישור ל-Rider טכני</label>
          <input
            name="riderUrl"
            type="url"
            className="form-input"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? 'יוצר אירוע...' : 'צור אירוע'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/events')}
          className="btn btn-secondary"
        >
          ביטול
        </button>
      </div>
    </form>
  )
}